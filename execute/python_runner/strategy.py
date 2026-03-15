import backtrader as bt
import math
import argparse
# from reader_json import read_input_json

# parser = argparse.ArgumentParser()
# parser.add_argument("--input", required=True, help="Path to the input JSON file")
# args = parser.parse_args()

# config = read_input_json(args.input)


class Strategy(bt.Strategy):

    params = (
        ("config", None),
    )

    def __init__(self):
        self.config = self.p.config

        self.signal_cfg = self.config['signal']
        self.factor_inputs = self.signal_cfg["inputs"]
        # type = self.signal_cfg['type']
        # lookback = self.signal_cfg['lookback']
        # lag = self.signal_cfg['lag']
        # inputs = self.signal_cfg['inputs']

        self.rebalance_cfg = self.config["rebalance"]
        # freq = self.rebalance_cfg['freq']
        # dayOfWeek = self.rebalance_cfg['dayOfWeek']
        # dayOfMonth = self.rebalance_cfg['dayOfMonth']


        self.portfolio_cfg = self.config["portfolio"]
        # selector = self.portfolio_cfg["selector"]
        # selector_type = selector["type"]
        # selector_k = selector["k"]
        # weighting = self.portfolio_cfg["weighting"]
        # targetCashWeight = self.portfolio_cfg["targetCashWeight"]

        
        self.risk_cfg = self.config["riskManagement"]
        # maxDrawdown = self.risk_cfg["maxDrawdown"]
        # maxPosition = self.risk_cfg["maxPosition"]
        # maxTurnover = self.risk_cfg["maxTurnover"]
        # volTarget = self.risk_cfg["volTarget"]


        self.execute_cfg = self.config["execute"]
        # priceType = self.execute_cfg["priceType"]
        # commission = self.execute_cfg["commissionBps"]
        # slippage = self.execute_cfg["slippageBps"]
        # allowShort = self.execute_cfg["allowShort"]

        self.time_range = self.config["timeRange"]
        # startDate = self.time_range["startDate"]
        # endDate = self.time_range["endDate"]
        # calendar = self.time_range["calendar"]



        #准备因子线
        # self.data_factor_map = {}
        # for data in self.datas:
        #     self.data_factor_map[data] = {
        #         "mom_60": data.mom_60,
        #         "mom_5": data.mom_5,
        #     }
        
        self.data_factor_map = {
            data: {
                item["codeKey"]: getattr(data, item["codeKey"])
                for item in self.factor_inputs
            }
            for data in self.datas
        }

        # self.data_factor_map[datas] = {
        #     item["codeKey"]: getattr(datas, item["codeKey"])
        #     for item in self.factor_inputs
        # }
        self.peak_value = self.broker.getvalue()


    def _compute_score(self, data, factor_inputs, lag):
        """
        根据 inputs 里的 codeKey / weight 计算单只股票综合得分
        """
        factor_map = self.data_factor_map[data]
        score = 0.0
        used = 0

        for item in factor_inputs:
            code_key = item.get("codeKey")
            weight = item.get("weight", 0.0)

            line = factor_map.get(code_key)
            if line is None:
                continue

            value = line[-lag]

            # 过滤 nan
            if value is None:
                continue
            if isinstance(value, float) and math.isnan(value):
                continue

            score += weight * value
            used += 1

        if used == 0:
            return None

        return score

    def _should_rebalance(self):
        """
        先写一个最简单版本：
        freq = 0 -> weekly
        freq = 1 -> monthly
        """
        dt = self.datas[0].datetime.date(0)
        freq = self.rebalance_cfg['freq']

        if freq == 0:  # weekly
            year_week = dt.isocalendar()[:2]

            if not hasattr(self, "last_rebalance_week"):
                self.last_rebalance_week = None

            if year_week != self.last_rebalance_week:
                self.last_rebalance_week = year_week
                return True
            return False

        if freq == 1:  # monthly
            year_month = (dt.year, dt.month)

            if not hasattr(self, "last_rebalance_month"):
                self.last_rebalance_month = None

            if year_month != self.last_rebalance_month:
                self.last_rebalance_month = year_month
                return True
            return False

        return True

    def _close_all_positions(self):
        for data in self.datas:
            self.order_target_percent(data=data, target=0.0)


    def next(self):
        print("date:", self.datas[0].datetime.date(0))
        #处理lag
        lag = self.signal_cfg['lag']
        if len(self.datas[0]) <= lag:
            return
        
        #检查是否调仓
        if not self._should_rebalance():
            return

        #回撤限制
        current_value = self.broker.getvalue()
        self.peak_value = max(self.peak_value, current_value)
        max_drawdown = (self.peak_value - current_value) / self.peak_value
        maxDrawdown = self.risk_cfg['maxDrawdown']
        if max_drawdown >= maxDrawdown:
            # if self.position:
            if any(self.getposition(d).size != 0 for d in self.datas):
                self._close_all_positions()
                return

        scored = []
        ##factor_inputs = self.signal_cfg['inputs'] #缓存，提高计算效率
        ## 在__init__增加缓存
        for data in self.datas:
            if len(data) <= lag:
                continue
            if data.close[0] is None:
                continue
            #score = self._compute_score(data, factor_inputs, lag)
            score = self._compute_score(data, self.factor_inputs, lag)
            if score is None:
                continue
            scored.append((data, score))
        if not scored:
            return
    
        # 5. Top-K 选股
        scored.sort(key=lambda x: x[1], reverse=True)
        print("分数总计scored count:", len(scored))
        selector_cfg = self.portfolio_cfg["selector"]
        k = selector_cfg['k']
        top_k = scored[:k]


        # 6.等权目标仓位 (组合优化器将来放的地方)
        target_cash_weight = self.portfolio_cfg.get("targetCashWeight", 0.0)
        investable_weight = max(0.0, 1.0 - target_cash_weight)

        selected_count = len(top_k)
        if selected_count == 0:
                self._close_all_positions()
                return
        raw_weight = investable_weight / selected_count
        max_position_weight = self.risk_cfg["maxPositionWeight"]
        target_weight = min(raw_weight, max_position_weight)
        selected_set = {data for data, _ in top_k}

        # 7.先把未入选的清掉
        for data in self.datas:
            if data not in selected_set:
                self.order_target_percent(data=data, target=0.0)

        # 8.对入选股票下目标权重单
        price_type = self.execute_cfg.get("priceType", 0)  # 0=open, 1=close
        exectype = bt.Order.Close if price_type == 1 else None

        for data, score in top_k:
            if exectype is None:
                self.order_target_percent(data=data, target=target_weight)
            else:
                self.order_target_percent(data=data, target=target_weight, exectype=exectype)

    
#波动率控制
#换手率控制 先不急着做