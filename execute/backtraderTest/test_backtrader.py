import backtrader as bt


### 策略层
class TestStrategy(bt.Strategy):
     def next(self):
        print(f'Date: {self.datas[0].datetime.date(0)}, Close: {self.datas[0].close[0]}')


   
    #启动引擎
cerebro = bt.Cerebro()
    #加策略
cerebro.addstrategy(TestStrategy, period=10)
    #加数据（BackTrader 自带 Yahoo CSV 示例）
    ##时间范围
data = bt.feeds.YahooFinanceCSVData(
    dataname='orcl-1995-2014.txt',
    fromdate=None,
    todate=None
)
cerebro.adddata(data)

###信号与因子
# factor 和 weight
#  因子模型
#  历史窗口长度
#  滞后期

### 风控层

##仓位控制（固定仓位，每次交易固定数量的股票）
cerebro.addsizer(bt.sizers.FixedSize, stake=10)
##仓位控制 (百分比仓位）
cerebro.addsizer(bt.sizers.PercentSizer, percents=50)
#单票最大仓位
class MaxWeightSizer(bt.Sizer):
    params = (
        ('max_weight', 0.1),
    )

    def _getsizing(self, comminfo, cash, data, isbuy):
        price = data.close[0]
        total_value = self.broker.getvalue()
        max_value = total_value * self.p.max_weight
        size = int(max_value / price)
        return max(size, 0)

##最大回撤

##波动率
class VolatilitySizer(bt.Sizer):

    params = (
        ('target_vol', 0.1),
    )

    def _getsizing(self, comminfo, cash, data, isbuy):
        vol = data.vol[0]
        if vol == 0:
            return 0
        weight = self.p.target_vol / vol
        weight = min(weight, 1.0)
        value = self.broker.getvalue()
        target_value = value * weight
        size = int(target_value / data.close[0])
        return size



#杠杆
cerebro.broker.setcommission(leverage=2.0)
#换手率
class TurnoverController:
    def __init__(self, max_turnover):
        self.max_turnover = max_turnover
        self.last_positions = {}

    def next(self, strategy):
        current_positions = {data._name: strategy.getposition(data).size for data in strategy.datas}
        turnover = sum(abs(current_positions.get(name, 0) - self.last_positions.get(name, 0)) for name in set(current_positions) | set(self.last_positions))
        if turnover > self.max_turnover:
            print(f"Warning: Turnover {turnover} exceeds max {self.max_turnover}")
            # 可以选择调整仓位以满足换手率限制
        self.last_positions = current_positions





# 组合成Portfolio
# 资金（初始资金10万）  ##无风险资金怎么引入
cerebro.broker.setcash(100000)
# 选股规则
######Top K先不做，写死
# 选股数量

# 优化器
###暂时就只有Linear_Weight





### 执行层
# 交易成本（假设万1）
cerebro.broker.setcommission(commission=0.001)
# 滑点模拟(假设万1）
cerebro.broker.set_slippage_perc(perc=0.001)
# 是否允许卖空
cerebro.broker.set_shortcash(False)
# 成交时间
# next_open 还是 close，选一个









###结果层
    #Analyzer（回测指标）
cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')
    #回测以及结果读取
print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
results = cerebro.run()
strat = results[0]
print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())
print(strat.analyzers.sharpe.get_analysis())
print(strat.analyzers.drawdown.get_analysis())
print(strat.analyzers.returns.get_analysis())

cerebro.addobserver(bt.observers.Value)
cerebro.addobserver(bt.observers.Trades)
cerebro.addobserver("最大回撤",bt.observers.DrawDown)

print('画图结果如下',cerebro.plot())

