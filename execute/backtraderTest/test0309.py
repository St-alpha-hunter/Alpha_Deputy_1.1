import backtrader as bt

#系统配置参数
engine_params = (

            # ===== Rebalance =====
            ("rebalance_params", {
                "freq": 0,
                "dayOfWeek": 1,
                "dayOfMonth": None,
                "holidayPolicy": 0
            }),

            # ===== Signal =====
            ("signal_params", {
                "type": 0,
                "lookback": 20,
                "lag": 1,
                "inputs": [
                    {
                        "codeKey": "mom_9m",
                        "factor": "9-Month Momentum",
                        "weight": 0.18999999999999995
                    },
                    {
                        "codeKey": "eps",
                        "factor": "Earnings Per Share",
                        "weight": 0.81
                    }
                ]
            }),

            # ===== Portfolio =====
            ("portfolio_params", {
                "selector": {
                    "type": 0,
                    "k": 50
                },
                "weighting": {
                    "type": 0
                },
                "initialCash": 1000000,
                "targetCashWeight": 0.02
            }),

            # ===== Execute =====
            ("execute_params", {
                "priceType": 0,
                "commissionBps": 0.01,
                "slippageBps": 0.01,
                "allowShort": False
            }),

            # ===== Risk Management =====
            ("risk_params", {
                "maxDrawdown": 0.2,
                "maxPositionWeight": 0.1,
                "maxTurnover": 0.5,
                "maxLeverage": 1,
                "volTarget": 0.15
            }),

            # ===== Time Range =====
            ("time_range", {
                "startDate": "0001-01-01T00:00:00+00:00",
                "endDate": "0001-01-01T00:00:00+00:00",
                "calendar": "XNYS"
            })
        )

##调仓属性
rebalance_cfg = engine_params.rebalance_params
freq = rebalance_cfg['freq']        ##0默认是周度
dayOfWeek = rebalance_cfg['dayOfWeek']
dayOfMonth = rebalance_cfg['dayOfMonth']
holidayPolicy = rebalance_cfg['holidayPolicy']

##执行参数
execute_cfg = engine_params.execute_params
execution_price = execute_cfg['priceType']
commissionBps = execute_cfg['commissionBps']
slippageBps = execute_cfg['slippageBps']
allowShort = execute_cfg['allowShort']

##组合属性
portfolio_cfg = engine_params.portfolio_params
# selector_cfg = portfolio_cfg['selector']
# weighting_cfg = portfolio_cfg['weighting']  ##这块是权重模型，0默认是等权重模型
initialCash = portfolio_cfg['initialCash']
targetCashWeight = portfolio_cfg['targetCashWeight'] ##后续看看咋搞，不重要

##风控属性
risk_cfg = engine_params.risk_params
maxLeverage = risk_cfg['maxLeverage']

##时间范围
time_range_cfg = engine_params.time_range
startDate = time_range_cfg['startDate']
endDate = time_range_cfg['endDate']
calendar = time_range_cfg['calendar']

class TestStrategy(bt.Strategy):
    # params = (
    #     ('rebalance_freq', 'M'),
    #     ('max_drawdown', 0.2),
    #     ('max_weight', 0.1),
    #     ('target_vol', 0.1),
    #     ('execution_price', 'close'),
    # )
    def __init__(self):
        #策略配置
        strategy_config = {
                "rebalance": {
                    "freq": 0,
                    "dayOfWeek": 1,
                    "dayOfMonth": None,
                    "holidayPolicy": 0
                },
                "signal": {
                    "type": 0,
                    "lookback": 20,
                    "lag": 1,
                    "inputs": [ 
                        {"codeKey": "mom_9m", "factor": "9-Month Momentum", "weight": 0.18999999999999995}, 
                        {"codeKey": "eps", "factor": "Earnings Per Share", "weight": 0.81}
                        ]
                },
                "portfolio": {
                    "selector": {"type": 0, "k": 50},
                    "weighting": {"type": 0},
                    "targetCashWeight": 0.02
                },
                "risk": {
                    "maxDrawdown": 0.2,
                    "maxPositionWeight": 0.1,
                    "maxTurnover": 0.5,
                    "volTarget": 0.15
                },
                "execute": {
                    "priceType": 0
                }
            }
        
        self.factor_map = {
            "mom_9m": self.data.mom_9m,
            "eps": self.data.eps
        }
        

        ##交易信号 , 先准备一个假的因子线
        signal_cfg = self.strategy_config['signal']

        # self.factor_list = [f for f in signal_cfg['inputs']]


        # 示例：先用价格构造一个假的 9月动量因子
        self.mom_9m = self.data.close / self.data.close(-180) - 1
        # 示例：eps 现在没有真实数据，先占位
        self.eps_proxy = self.data.close * 0.0
        # codeKey -> line 映射
        self.factor_map = {
            "mom_9m": self.mom_9m,
            "eps": self.eps_proxy,
        }
        self.peak_value = self.broker.getvalue()


        #lookback = signal_cfg['lookback']
        lag = signal_cfg['lag']
        inputs = signal_cfg['inputs']

        ##组合属性
        portfolio_cfg = self.strategy_config['portfolio']
        selector_cfg = portfolio_cfg['selector'] ##选股规则和选多少个, selector 和 k
        weighting_cfg = portfolio_cfg['weighting']  ##这块是优化器，默认是等权重模型

        ##风控属性
        risk_cfg = self.strategy_config['risk']
        #maxDrawdown = risk_cfg['maxDrawdown']
        #maxPositionWeight = risk_cfg['maxPositionWeight']
        maxTurnover = risk_cfg['maxTurnover']
        #volTarget = risk_cfg['volTarget']


        ##需要在内部实现，必须在策略内部用它们去控制数据计算
        # (1) 因子及其权重 inputs
        #（2）lookback
        # (3) lag
        # (4) 最大回撤控制  （已经实现）
        #（5）个股最大持仓
        # (6) 换手率
        # (7) 波动率控制
        # (8) 选股规则，选多少个
    
    
    
    def next(self):
        #lookback(暂时不做)

        #lag
        lag = self.signal_cfg["lag"]
        if len(self.data) < lag:
            return
        
        #是否到调仓日
        if not self._should_rebalance():
            return

        ##回撤限制
        current_value = self.broker.getvalue()
        self.peak_value = max(self.peak_value, current_value)
        max_drawdown = (self.peak_value - current_value) / self.peak_value
        maxDrawdown = self.risk_cfg['maxDrawdown']
        # SetMaxDrawdown = self.strategy_config['risk']['maxDrawdown']
        if max_drawdown >= maxDrawdown:
            if self.position:
                self._close_all_positions()
                return

        scored = []
        factor_inputs = self.signal_cfg['inputs']

        for data in self.datas:
            if len(data) <= lag:
                continue
            if not data.close[0] or data.close[0] is None:
                continue
            score = self._compute_score(data, factor_inputs, lag)
            if score is None:
                continue
            scored.append((data, score))

        if not scored:
            return

        # 5. Top-K 选股
        scored.sort(key=lambda x: x[1], reverse=True)
        selector_cfg = self.portfolio_cfg["selector"]
        k = selector_cfg['k']
        top_k = scored[:k]


        # 6.等权目标仓位
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
            if isinstance(value, float):
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
        freq = self.rebalance_cfg.get("freq", 1)

        if freq == 0:  # weekly
            year_week = dt.isocalendar()[:2]
            if year_week != self.last_rebalance_week:
                self.last_rebalance_week = year_week
                return True
            return False

        if freq == 1:  # monthly
            year_month = (dt.year, dt.month)
            if year_month != self.last_rebalance_month:
                self.last_rebalance_month = year_month
                return True
            return False

        return True

    def _close_all_positions(self):
        for data in self.datas:
            self.order_target_percent(data=data, target=0.0)
    
       
        #波动率控制
        #换手率控制 先不急着做

###投喂策略
cerebro = bt.Cerebro()
cerebro.addstrategy(TestStrategy)
###投喂日历&数据
# data = bt.feeds.YahooFinanceCSVData(
#     dataname='orcl-1995-2014.txt'
# )

#未来数据
class factorCSVData(bt.feeds.GenericCSVData):
        lines = ('mom_9m','eps','vol_20d')

        params = (
            ('mom_9m', 6),
            ('eps', 7),
            ('vol_20d', 8),
        )

data = factorCSVData(
    dataname = 'data.csv',
    dtformat = '%Y-%m-%d',
)

cerebro.adddata(data)
###设定初始资金、手续费、滑点, 是否卖空等
cerebro.broker.setcash(initialCash)
cerebro.broker.setcommission(commission=commissionBps, leverage=maxLeverage)
cerebro.broker.set_slippage_perc(perc=slippageBps)
cerebro.broker.set_shortcash(allowShort)
###添加分析器，比如夏普比率、最大回撤、收益率等
cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')
###设置想观测的东西
cerebro.addobserver(bt.observers.Value)
cerebro.addobserver(bt.observers.Trades)
cerebro.addobserver("最大回撤",bt.observers.DrawDown)

print('开始价值Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
results = cerebro.run()
strat = results[0]
###
print('最终价值Final Portfolio Value: %.2f' % cerebro.broker.getvalue())
print('夏普比率',strat.analyzers.sharpe.get_analysis())
print('最大回撤',strat.analyzers.drawdown.get_analysis())
print('收益率',strat.analyzers.returns.get_analysis())
print('画图结果如下',cerebro.plot())