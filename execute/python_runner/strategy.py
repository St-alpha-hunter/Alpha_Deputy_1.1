import os
import pandas as pd
import backtrader as bt
import math
import argparse

UNIVERSE_SP = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)))), "pipeline/data/origin_sp")

# 初始股票池 origin.parquet 是这一天的标普 500 名单（和 pipeline/fetch_and_update_sp500.py 的 START 保持一致）
ORIGIN_DATE = pd.Timestamp("2020-12-21")


class Strategy(bt.Strategy):

    # backtrader 小知识：params 里声明的参数，可以在 cerebro.addstrategy(Strategy, config=..., origin_df=...) 时传进来，
    # 在策略里用 self.p.xxx 读取
    params = (
        ("config", None),
        # [成分股事件流 2026-10-02] 可选：直接传入初始池 / 成分股区间表（测试用例就是这么传的）。
        # 不传（None）就从 pipeline/data/origin_sp 下的 parquet 读
        ("origin_df", None),     # 列: symbol
        ("dynamic_df", None),    # 列: symbol, date_added, date_removed（date_removed 为空 = 至今仍在指数里）
    )

    def __init__(self):
        self.config = self.p.config

        self.signal_cfg = self.config['signal']
        self.factor_inputs = self.signal_cfg["inputs"]
        self.rebalance_cfg = self.config["rebalance"]
        self.portfolio_cfg = self.config["portfolio"]
        self.risk_cfg = self.config["riskManagement"]
        self.execute_cfg = self.config["execute"]
        self.time_range = self.config["timeRange"]

        # [因子平滑 2026-10-03] lookback = 因子平滑窗口：打分时取因子最近 lookback 天的平均值，而不是只取一天。
        # 1 = 不平滑（和改动之前的行为一样）。没配或配了非法值时按 1 处理
        self.lookback = max(1, int(self.signal_cfg.get("lookback") or 1))

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
        # 个股止损线：沿用前端的 maxDrawdown 字段，含义改为“单只股票相对持仓成本亏损超过该比例就卖出”
        self.stop_loss_pct = self.risk_cfg["maxDrawdown"]

        self.inital = self.config["portfolio"]["initialCash"]
        # 每个交易日的组合净值
        self.equity_curve = []
        # 每一笔成交（买/卖各算一笔），在 notify_order 里收集
        self.trade_list = []

        # [换手率限制 2026-09-30] 单次调仓的最大单边换手率，0.5 = 一次最多换掉半个组合（按净资产算）
        # 没配或配成 None 时不限制；0 = 只建仓、只止损，永不换股
        self.max_turnover = self.risk_cfg.get("maxTurnover")
        # [换手率限制 2026-09-30] 每次调仓记一条：日期、预估换手率、换了几只、是否被限制住
        self.turnover_list = []
        # ------------------------------------------------------------------
        # [成分股事件流 2026-10-02] 动态股票池
        # 原来的做法：用集合加减 (初始池 | 所有纳入) - 所有剔除 算开始日名单，
        #            next() 里只在调仓日、只匹配 “== 今天” 的事件 —— 会丢掉顺序、漏掉大量事件。
        # 现在的做法：把纳入/剔除拆成一条按时间排序的“事件流”，用一个指针从头往后依次应用：
        #   1. __init__ 里先“快进”：应用 ORIGIN_DATE 之后、startDate 之前的事件 → 得到开始日的名单
        #   2. next() 每天开头：应用所有 “日期 <= 今天” 且还没应用过的事件
        # 每条事件只应用一次；事件落在周末/节假日也会在下一个交易日补上
        # ------------------------------------------------------------------
        # tz_localize(None)：前端传来的日期带 "Z"（UTC 时区），去掉时区才能和 parquet 里不带时区的日期比较
        self.start_date = pd.Timestamp(self.time_range["startDate"]).tz_localize(None).normalize()
        self.end_date = pd.Timestamp(self.time_range["endDate"]).tz_localize(None).normalize()
        if self.start_date < ORIGIN_DATE:
            raise ValueError(
                f"回测开始日 {self.start_date.date()} 早于初始股票池日期 {ORIGIN_DATE.date()}，"
                f"初始池对这段时间来说是“未来”的名单，无法回测")

        origin_df, dynamic_df = self._load_universe()
        # 当前在指数里的股票代码（字符串集合）。注意它和 self.datas 无关：
        # self.datas 是回测开始前就固定的数据源列表，不能增删；这里只是一份“今天谁能参与打分”的名单
        self.current_date_set = set(origin_df["symbol"])
        self.universe_events = self._build_universe_events(dynamic_df)
        self.event_idx = 0      # 指针：下一条还没应用的事件

        # 快进到开始日：应用 startDate 之前的事件（startDate 当天的事件留给 next() 处理）
        self._advance_universe(until=self.start_date, inclusive=False)
        print(f"开始日 {self.start_date.date()} 成分股 {len(self.current_date_set)} 只，"
              f"回测期间还有 {len(self.universe_events) - self.event_idx} 条成分股变动")

    def _load_universe(self):
        """[成分股事件流 2026-10-02] 原来叫 update_universe_day_by_day：读初始池和成分股区间表，优先用 params 传进来的"""
        origin_df = self.p.origin_df
        if origin_df is None:
            origin_df = pd.read_parquet(os.path.join(UNIVERSE_SP, "origin.parquet"))

        dynamic_df = self.p.dynamic_df
        if dynamic_df is None:
            dynamic_df = pd.read_parquet(os.path.join(UNIVERSE_SP, "dynamic.parquet"))
        return origin_df, dynamic_df

    def _build_universe_events(self, dynamic_df):
        """
        [成分股事件流 2026-10-02] 把区间表拆成按时间排序的事件流。

        区间表每行：symbol, date_added, date_removed
        拆成两条事件：(date_added, symbol, "add")，以及 date_removed 不为空时的 (date_removed, symbol, "remove")

        只保留 ORIGIN_DATE 之后、endDate 之前（含）的事件：
          - ORIGIN_DATE 及之前的变动已经体现在初始池 origin.parquet 里了
          - endDate 之后的变动回测用不到
        """
        dy = dynamic_df.copy()
        # 统一转成 Timestamp 再比较，不依赖字符串格式；空值 → NaT
        dy["date_added"] = pd.to_datetime(dy["date_added"], errors="coerce")
        dy["date_removed"] = pd.to_datetime(dy["date_removed"], errors="coerce")

        adds = (dy.dropna(subset=["date_added"])[["date_added", "symbol"]]
                .rename(columns={"date_added": "date"}).assign(action="add"))
        removes = (dy.dropna(subset=["date_removed"])[["date_removed", "symbol"]]
                   .rename(columns={"date_removed": "date"}).assign(action="remove"))

        events = pd.concat([adds, removes], ignore_index=True)
        events = events[(events["date"] > ORIGIN_DATE) & (events["date"] <= self.end_date)]
        # mergesort 是稳定排序：同一天的多条事件保持原来的相对顺序
        events = events.sort_values("date", kind="mergesort").reset_index(drop=True)

        # itertuples 把每行变成一个具名元组，之后可以用 ev.date / ev.symbol / ev.action 访问
        return list(events.itertuples(index=False))

    def _advance_universe(self, until, inclusive):
        """
        [成分股事件流 2026-10-02] 从指针位置开始，依次应用日期 < until（inclusive=True 时为 <=）的事件，指针随之后移。
        某只股票在不在名单里，只取决于它“截至今天的最后一条事件”，所以必须按时间顺序一条条应用。
        """
        while self.event_idx < len(self.universe_events):
            ev = self.universe_events[self.event_idx]
            if ev.date > until or (ev.date == until and not inclusive):
                break
            if ev.action == "add":
                self.current_date_set.add(ev.symbol)
            else:
                self.current_date_set.discard(ev.symbol)   # discard：不在集合里也不报错（remove 会报 KeyError）
            self.event_idx += 1


    def _smoothed_factor_value(self, line, lag, available):
        """
        [因子平滑 2026-10-03] 取因子在 [lag, lag + lookback - 1] 天前这段窗口里的平均值（跳过 NaN）。

        例：lag=1, lookback=5 → 取 line[-1], line[-2], ..., line[-5] 这 5 天（昨天往前数 5 天）的均值。
        lag 仍然负责“避免用到今天收盘才知道的数据”，lookback 只是把一天的值换成一段的均值。

        backtrader 小知识：line[-k] 是 k 根 bar 之前的值；k 超过已有的 bar 数会报 IndexError，
        所以窗口长度要用 available（这只股票当前能往回看的 bar 数）截一下 —— 刚上市的股票数据不够时，有几天算几天。
        全部是 NaN 时返回 None。
        """
        n = min(self.lookback, available)
        values = []
        for ago in range(lag, lag + n):
            v = line[-ago]
            if v is None or (isinstance(v, float) and math.isnan(v)):
                continue
            values.append(v)
        if not values:
            return None
        return sum(values) / len(values)

    def _compute_score(self, data, factor_inputs, lag):
        """
        根据 inputs 里的 codeKey / weight 计算单只股票综合得分
        """
        factor_map = self.data_factor_map[data]
        score = 0.0
        used = 0
        # [因子平滑 2026-10-03] 从 lag 天前开始，最多还能往回看几根 bar（调用方已保证 len(data) > lag，所以至少是 1）
        available = len(data) - lag

        for item in factor_inputs:
            code_key = item.get("codeKey")
            weight = item.get("weight", 0.0)

            line = factor_map.get(code_key)
            if line is None:
                continue

            # [因子平滑 2026-10-03] 原来是 value = line[-lag]，只取 lag 天前那一天的值；
            # 现在取 lookback 天窗口的均值，NaN 的过滤也挪进了 _smoothed_factor_value
            value = self._smoothed_factor_value(line, lag, available)
            if value is None:
                continue

            score += weight * value
            used += 1

        if used == 0:
            return None

        return score

    def _record_portfolio_value(self):
        current_date = self.datas[0].datetime.date(0)
        current_value = self.broker.getvalue()

        self.equity_curve.append({
            "date": current_date.isoformat(),
            "value": float(current_value),
            "netValue": (current_value / self.inital)
        })

        print(f"日期是{current_date.isoformat()}，价值是{float(current_value)}, 净值是{(current_value / self.inital)} \n")

    def notify_order(self, order):
        # 提交/接受阶段还没成交，不处理
        if order.status in (order.Submitted, order.Accepted):
            return

        if order.status == order.Completed:
            size = float(order.executed.size)
            price = float(order.executed.price)
            self.trade_list.append({
                "date": bt.num2date(order.executed.dt).date().isoformat(),
                "symbol": order.data._name,
                "side": "buy" if order.isbuy() else "sell",
                "size": abs(size),
                "price": price,
                "value": abs(size) * price,
                "commission": float(order.executed.comm),
            })
            return

        # Canceled / Margin / Rejected / Expired：不计入成交，只打日志方便排查
        print(f"订单未成交: {order.data._name} {'买入' if order.isbuy() else '卖出'} "
              f"数量 {order.created.size} 状态 {order.getstatusname()}")

    def _should_rebalance(self):
        """
        先写一个最简单版本：
        freq = 0 -> weekly
        freq = 1 -> monthly
        """
        dt = self.datas[0].datetime.date(0)
        freq = self.rebalance_cfg['freq']

        # 后端传数字（0/1），mock.json 里是字符串（"Weekly"/"Monthly"），两种都认
        if freq in (0, "Weekly"):  # weekly
            year_week = dt.isocalendar()[:2]

            if not hasattr(self, "last_rebalance_week"):
                self.last_rebalance_week = None

            if year_week != self.last_rebalance_week:
                self.last_rebalance_week = year_week
                return True
            return False

        if freq in (1, "Monthly"):  # monthly
            year_month = (dt.year, dt.month)

            if not hasattr(self, "last_rebalance_month"):
                self.last_rebalance_month = None

            if year_month != self.last_rebalance_month:
                self.last_rebalance_month = year_month
                return True
            return False

        return True

    def _check_stop_loss(self):
        """
        每根bar检查每只持仓：收盘价相对持仓均价亏损 >= stop_loss_pct 就清掉这一只。
        返回当天触发止损的股票集合，调仓时不再买回。
        卖出的钱留作现金，等下次调仓再分配。
        """
        stopped = set()
        if not self.stop_loss_pct or self.stop_loss_pct <= 0:
            return stopped

        today = self.datas[0].datetime.date(0)
        for data in self.datas:
            pos = self.getposition(data)
            if pos.size <= 0:
                continue
            # 当天没有新 bar（停牌）就不判断，避免用旧价格
            if len(data) == 0 or data.datetime.date(0) != today:
                continue

            loss = 1.0 - data.close[0] / pos.price
            if loss >= self.stop_loss_pct:
                print(f"止损: {data._name} 成本 {pos.price:.2f} 现价 {data.close[0]:.2f} 亏损 {loss:.2%}")
                self.order_target_percent(data=data, target=0.0)
                stopped.add(data)
        return stopped

    # ------------------------------------------------------------------
    # [换手率限制 2026-09-30] 整个方法都是这次新加的
    # ------------------------------------------------------------------
    def _plan_rebalance_with_turnover_limit(self, scored, top_k, stopped_today,
                                            investable_weight, max_position_weight):
        """
        在 maxTurnover 额度内，决定这次调仓“卖哪些、买哪些、每只配多少”。

        换手率定义（单次、单边）：
            turnover = Σ |目标权重 - 当前权重| / 2      权重都以净资产 broker.getvalue() 为分母
        例：把 A(10%) 整只换成 B(10%)，|0-10%| + |10%-0| = 20%，除以 2 = 10%。

        规则（和你确认过的）：
          1. 用现金填空位不计入换手 —— 所以第一次建仓（全是空位）天然豁免
          2. 止损不受换手限制 —— 今天止损的票已经在 _check_stop_loss 里下了卖单，这里既不算它、也不动它
          3. 留下来的股票回到等权，产生的调整也计入额度
          4. 贪心换股：每一步“卖掉当前最差的一只 + 买入最好的一只新候选”，
             加到超出额度为止；没换成的下次调仓继续比较

        返回:
            targets: {data: 目标权重}，最终要持有的股票
            to_sell: [data]，要清仓的股票
            info:    记录用的字典（预估换手率、换了几只、是否被额度限制）
        """
        value = self.broker.getvalue()

        # backtrader 小知识：self.getposition(data) 返回该股票的 Position，
        # .size 是持股数（正=多头），.price 是持仓均价。当前权重 = 持股数 × 最新收盘价 / 净资产
        def current_weight(data):
            size = self.getposition(data).size
            if size == 0 or len(data) == 0 or value <= 0:
                return 0.0
            return size * data.close[0] / value

        # 当前持仓：只算多头，并排除今天已经止损的（规则 2）
        holdings = [d for d in self.datas if self.getposition(d).size > 0 and d not in stopped_today]
        holding_set = set(holdings)
        cur_w = {d: current_weight(d) for d in holdings}

        score_map = dict(scored)
        selected_set = {d for d, _ in top_k}

        # 卖出候选：持有但不在新 Top-K 里的，得分从低到高（今天没得分的，比如停牌，排最前面先卖）
        sell_cands = sorted([d for d in holdings if d not in selected_set],key=lambda d: score_map.get(d, float("-inf")),)
        # 买入候选：在新 Top-K 里但还没持有的，top_k 本身已经按得分从高到低排好
        buy_cands = [d for d, _ in top_k if d not in holding_set]

        # 空位 = 目标持仓数 - 当前持仓数。先用现金把空位填上，这部分不计入换手（规则 1）
        free_slots = max(0, len(top_k) - len(holdings))
        fills = buy_cands[:free_slots]
        swap_buys = buy_cands[free_slots:]

        def plan(n):
            """换 n 步之后的方案：最终持仓、每只目标权重、预估换手率"""
            sold = set(sell_cands[:n])
            bought = swap_buys[:n]
            final = [d for d in holdings if d not in sold] + fills + bought
            tw = min(investable_weight / len(final), max_position_weight) if final else 0.0

            turnover = 0.0
            for d in holdings:                          # 原持仓：留下的回到等权（规则 3），卖掉的回到 0
                target = tw if d not in sold else 0.0
                turnover += abs(target - cur_w[d])
            turnover += tw * len(bought)                # 换进来的新股票：从 0 买到 tw
            # fills 从现金买入，不计入（规则 1）
            return final, tw, turnover / 2.0

        max_steps = max(len(sell_cands), len(swap_buys))

        # 没配额度：不限制，全部换掉（等同于改动之前的行为）
        if self.max_turnover is None:
            n = max_steps
        else:
            # 贪心：一步一步加，超出额度就停（规则 4）
            n = 0
            for step in range(1, max_steps + 1):
                if plan(step)[2] > self.max_turnover + 1e-9:
                    break
                n = step

        final, tw, turnover = plan(n)
        targets = {d: tw for d in final}

        # 特殊情况：一只都不换，光是“留下的股票回到等权”就已经超额度了
        # （比如某只涨很多、偏离等权很远）。这时不换股，并且只把留下的股票
        # 朝等权方向挪一部分：新权重 = 当前 + λ × (等权 - 当前)，λ = 额度 / 需要的换手
        partial = 1.0
        if self.max_turnover is not None and n == 0 and turnover > self.max_turnover + 1e-9:
            partial = self.max_turnover / turnover
            for d in holdings:
                targets[d] = cur_w[d] + partial * (tw - cur_w[d])
            turnover = self.max_turnover

        to_sell = [d for d in holdings if d not in targets]

        info = {
            "turnover": float(turnover),
            "swaps": n,
            "fills": len(fills),
            # 额度有没有把本来想做的调仓挡住一部分
            "limited": n < max_steps or partial < 1.0,
        }
        return targets, to_sell, info

    def _close_all_positions(self):
        for data in self.datas:
            # 只平有持仓的；还没上市的股票没有价格，对它下单会报错
            if self.getposition(data).size != 0:
                self.order_target_percent(data=data, target=0.0)


    def prenext(self):
        # backtrader 默认要等所有 data feed 都有数据才调用 next()，
        # 股票池里有晚上市的股票（如 Q 2025-10-27 才有数据）会导致前面几年全被跳过。
        # 这里让 prenext 也走 next，还没上市的股票在打分时跳过。
        self.next()


    def next(self):
        print("date:", self.datas[0].datetime.date(0))

        today = self.datas[0].datetime.date(0)

        ###维护当天的动态股票池
        # [成分股事件流 2026-10-02] 原来用 “== 今天” 匹配纳入/剔除，再做集合加减；
        # 现在改成推进事件流指针：应用所有 “日期 <= 今天” 且还没应用过的事件。
        # 放在 next() 最开头、调仓判断之前 → 每个交易日都会执行，不会因为不是调仓日而漏掉事件
        self._advance_universe(until=pd.Timestamp(today), inclusive=True)



        # 1. 每根bar都记录组合净值
        self._record_portfolio_value()

        # 2. 每根bar都检查个股止损，而不是只在调仓日检查
        stopped_today = self._check_stop_loss()

        #处理lag
        lag = self.signal_cfg['lag']
        if len(self.datas[0]) <= lag:
            return
        
        #检查是否调仓
        if not self._should_rebalance():
            return

        #回撤限制
        # current_value = self.broker.getvalue()
        # self.peak_value = max(self.peak_value, current_value)

        # if self.peak_value > 0:
        #     max_drawdown = (self.peak_value - current_value) / self.peak_value
        # else:
        #     max_drawdown = 0.0

        # maxDrawdown = self.risk_cfg['maxDrawdown']

        # if max_drawdown >= maxDrawdown:
        #     # if self.position:
        #     if any(self.getposition(d).size != 0 for d in self.datas):
        #         self._close_all_positions()
        #         return

        scored = []

        ##factor_inputs = self.signal_cfg['inputs'] #缓存，提高计算效率
        ## 在__init__增加缓存
        for data in self.datas:
            # 还没上市（没有任何 bar）的股票跳过
            if len(data) == 0:
                continue
            if data._name not in self.current_date_set:
                continue
            # 今天刚触发止损的不参与打分，避免同一根bar又买回来
            if data in stopped_today:
                continue
            # 当天没有新 bar（还没上市 / 停牌），不要拿旧数据当今天的算
            if data.datetime.date(0) != today:
                continue
            if len(data) <= lag:
                continue
            if data.close[0] is None:
                continue
            if isinstance(data.close[0], float) and math.isnan(data.close[0]):
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
        max_position_weight = self.risk_cfg["maxPositionWeight"]

        # [换手率限制 2026-09-30] 原来这里直接算 target_weight，然后“未入选的全卖、入选的全买”。
        # 现在改成先交给 _plan_rebalance_with_turnover_limit 在换手额度内做计划，
        # 等权权重也挪进去算了（因为最终持仓数可能 > K：没换掉的旧股票会继续留着）
        targets, to_sell, info = self._plan_rebalance_with_turnover_limit(
            scored, top_k, stopped_today, investable_weight, max_position_weight)

        # [换手率限制 2026-09-30] 记录这次调仓的换手情况，runner.py 会把它输出成 turnoverList
        info["date"] = self.datas[0].datetime.date(0).isoformat()
        self.turnover_list.append(info)
        print(f"调仓换手: 预估 {info['turnover']:.2%}，换股 {info['swaps']} 只，"
              f"填空位 {info['fills']} 只，{'被额度限制' if info['limited'] else '未受限'}")

        # 7.先卖出（没入选、且在额度内被换掉的）
        # [换手率限制 2026-09-30] 原来是遍历所有 datas、卖掉所有未入选的；现在只卖计划里的 to_sell。
        # 止损的票不在 to_sell 里（计划时已排除），所以不会重复卖出变成空头
        for data in to_sell:
            self.order_target_percent(data=data, target=0.0)

        # 8.再对最终持仓下目标权重单
        price_type = self.execute_cfg.get("priceType", 0)  # 0=open, 1=close
        exectype = bt.Order.Close if price_type == 1 else None

        # [换手率限制 2026-09-30] 原来遍历 top_k 并统一用 target_weight；现在遍历计划里的 targets，
        # 每只可能有自己的权重（额度不够时，留下的股票只朝等权挪一部分）
        # backtrader 小知识：order_target_percent 会自己算“要从当前仓位买/卖多少股”才能到目标权重，
        # 权重的分母是 broker.getvalue()（净资产），用的价格是当前 bar 的收盘价
        for data, weight in targets.items():
            if exectype is None:
                self.order_target_percent(data=data, target=weight)
            else:
                self.order_target_percent(data=data, target=weight, exectype=exectype)

    
#波动率控制
#换手率控制 [换手率限制 2026-09-30] 已实现，见 _plan_rebalance_with_turnover_limit


# ======================================================================
# [测试用例 2026-10-01] 直接运行本文件（python strategy.py 或 VS Code 里 F5）就能调试 Strategy
#   - 不依赖 pipeline 的价格数据：自己生成几只股票的假行情和因子，结果每次都一样（固定随机种子）
#   - 被 runner.py import 时不会执行（只有直接运行本文件时 __name__ 才是 "__main__"）
#   - 想调试哪里，就在 Strategy 的方法里打断点，然后运行本文件
# ======================================================================
if __name__ == "__main__":
    import numpy as np

    # [测试用例 2026-10-01] 用真实的标普代码当名字，之后加了每日成分股过滤也能直接测
    TEST_SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL"]

    # [测试用例 2026-10-01] 配置结构和前端/后端传来的 StrategySpecV0 一致，改这里就能测不同参数
    TEST_CONFIG = {
        "name": "strategy_debug",
        "universe": "SP500",
        "rebalance": {"freq": "Weekly", "dayOfWeek": 1, "dayOfMonth": 1, "holidayPolicy": 0},
        "signal": {
            "type": 0, "lookback": 20, "lag": 1,
            "inputs": [
                {"codeKey": "mom_60", "factor": "3-Month Momentum", "weight": 0.8},
                {"codeKey": "mom_5", "factor": "5-Day Momentum", "weight": 0.2},
            ],
        },
        "portfolio": {
            "selector": {"type": 0, "k": 3},        # 6 只里选 3 只，换股才有得换
            "weighting": {"type": 0},
            "initialCash": 1_000_000,
            "targetCashWeight": 0.02,
        },
        "timeRange": {
            "startDate": "2023-01-02T00:00:00.000Z",
            "endDate": "2024-06-28T00:00:00.000Z",
            "calendar": "XNYS",
        },
        "execute": {"priceType": 0, "commissionBps": 0.0001, "slippageBps": 0.0001, "allowShort": False},
        "riskManagement": {
            "maxDrawdown": 0.2,                      # 个股止损线
            "maxPositionWeight": 0.4,
            # k=3 时每只约 33%，换一只 ≈ 33% 换手；设 0.4 = 每次最多换 1 只，想换 2 只时就能看到“被额度限制”
            "maxTurnover": 0.4,
            "maxLeverage": 1,
            "volTarget": 0.15,
        },
    }

    def make_fake_stock(seed, dates):
        """
        [测试用例 2026-10-01] 生成一只股票的假行情 + 因子列。
        前半段和后半段的漂移不同，这样动量排名会在中途变化，能触发换股和换手限制。
        """
        rng = np.random.default_rng(seed)
        half = len(dates) // 2
        drift = np.r_[np.full(half, rng.normal(0, 0.002)), np.full(len(dates) - half, rng.normal(0, 0.002))]
        close = 100 * np.exp(np.cumsum(drift + rng.normal(0, 0.02, len(dates))))

        df = pd.DataFrame(index=pd.DatetimeIndex(dates, name="datetime"))
        df["close"] = close
        df["open"] = df["close"].shift(1).fillna(df["close"]) * (1 + rng.normal(0, 0.003, len(dates)))
        df["high"] = df[["open", "close"]].max(axis=1) * 1.005
        df["low"] = df[["open", "close"]].min(axis=1) * 0.995
        df["volume"] = 1_000_000
        # 因子列名要和 TEST_CONFIG 里的 codeKey 对上；算法和 pipeline 的 compute_mom 一样
        df["mom_60"] = df["close"].pct_change(60)
        df["mom_5"] = df["close"].pct_change(5)
        return df

    # [测试用例 2026-10-01] 和 data_feed.create_factorData 做的事一样：
    # 在 backtrader 自带的 PandasData 上，加上因子这几条 line，并告诉它对应 DataFrame 的哪一列
    class FakeFactorData(bt.feeds.PandasData):
        lines = ("mom_60", "mom_5")
        params = (
            ("datetime", None),        # None = 用 DataFrame 的 index 当日期
            ("open", "open"), ("high", "high"), ("low", "low"),
            ("close", "close"), ("volume", "volume"), ("openinterest", None),
            ("mom_60", "mom_60"), ("mom_5", "mom_5"),
        )

    # [测试用例 2026-10-01] 下面这段和 runner.py 的 main() 基本一致，只是数据换成了假数据
    cerebro = bt.Cerebro()

    dates = pd.bdate_range("2023-01-02", "2024-06-28")
    for i, symbol in enumerate(TEST_SYMBOLS):
        cerebro.adddata(FakeFactorData(dataname=make_fake_stock(seed=i, dates=dates)), name=symbol)

    # [成分股事件流 2026-10-02] 手写一份小股票池，专门覆盖几种边界情况（不再依赖真实的 parquet 文件）：
    #   - GOOGL 不在初始池里，2023-09-16（周六）纳入 → 应该在下一个交易日 09-18（周一）才出现
    #   - MSFT 2023-08-16（周三，非调仓日）剔除 → 当天就应该消失，不用等到调仓日
    #   - AMZN 2022-12-28 剔除（在 ORIGIN_DATE 之后、回测开始之前）→ 快进阶段就该移出
    #          2023-03-01 又重新纳入（第二行区间）→ 验证“先剔除再纳入”的顺序没丢
    #   - AAPL/NVDA/META 是很早以前纳入、至今仍在的老成分股（事件早于 ORIGIN_DATE，会被忽略）
    TEST_ORIGIN = pd.DataFrame({"symbol": ["AAPL", "MSFT", "NVDA", "AMZN", "META"]})
    TEST_DYNAMIC = pd.DataFrame([
        {"symbol": "AAPL",  "date_added": "1982-11-30", "date_removed": None},
        {"symbol": "NVDA",  "date_added": "2001-11-30", "date_removed": None},
        {"symbol": "META",  "date_added": "2013-12-23", "date_removed": None},
        {"symbol": "MSFT",  "date_added": "1994-06-01", "date_removed": "2023-08-16"},
        {"symbol": "AMZN",  "date_added": "2005-11-18", "date_removed": "2022-12-28"},
        {"symbol": "AMZN",  "date_added": "2023-03-01", "date_removed": None},
        {"symbol": "GOOGL", "date_added": "2023-09-16", "date_removed": None},
    ])

    # [成分股事件流 2026-10-02] 继承 Strategy，每天记一下当天的成分股名单，跑完拿来核对。
    # 只在测试里用，不影响正式的 Strategy
    class DebugStrategy(Strategy):
        def next(self):
            super().next()
            if not hasattr(self, "member_log"):
                self.member_log = {}
            self.member_log[self.datas[0].datetime.date(0).isoformat()] = set(self.current_date_set)

    cerebro.addstrategy(DebugStrategy, config=TEST_CONFIG, origin_df=TEST_ORIGIN, dynamic_df=TEST_DYNAMIC)
    cerebro.broker.setcash(TEST_CONFIG["portfolio"]["initialCash"])
    cerebro.broker.setcommission(commission=TEST_CONFIG["execute"]["commissionBps"])
    cerebro.broker.set_slippage_perc(perc=TEST_CONFIG["execute"]["slippageBps"])

    strat = cerebro.run()[0]

    # [测试用例 2026-10-01] 跑完打印一个小结，方便一眼看结果
    print("\n" + "=" * 60)
    print(f"期末资产: {cerebro.broker.getvalue():,.0f}   "
          f"净值: {strat.equity_curve[-1]['netValue']:.4f}")
    print(f"成交笔数: {len(strat.trade_list)}")
    print(f"调仓次数: {len(strat.turnover_list)}，"
          f"其中被换手额度限制: {sum(1 for x in strat.turnover_list if x['limited'])} 次")
    for x in strat.turnover_list[:10]:
        print(f"  {x['date']}  换手 {x['turnover']:.1%}  换股 {x['swaps']}  填空位 {x['fills']}"
              f"  {'受限' if x['limited'] else ''}")

    # [成分股事件流 2026-10-02] 核对几个关键日期的成分股名单是否符合预期
    print("-" * 60)
    print("成分股事件流检查：")
    checks = [
        ("2023-01-03", "AMZN", False, "快进阶段已剔除（2022-12-28）"),
        ("2023-02-28", "AMZN", False, "重新纳入前一天"),
        ("2023-03-01", "AMZN", True,  "重新纳入当天"),
        ("2023-08-15", "MSFT", True,  "剔除前一天"),
        ("2023-08-16", "MSFT", False, "周三剔除，当天生效（非调仓日）"),
        ("2023-09-15", "GOOGL", False, "周五，还没纳入"),
        ("2023-09-18", "GOOGL", True,  "周六纳入 → 周一补上"),
    ]
    for day, symbol, expected, desc in checks:
        actual = symbol in strat.member_log.get(day, set())
        print(f"  {'✅' if actual == expected else '❌'} {day} {symbol} {'在' if expected else '不在'}池中 —— {desc}")
    print("=" * 60)