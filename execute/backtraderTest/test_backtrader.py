import backtrader as bt


# # 1. 策略

##策略参数
# class TestStrategy(bt.Strategy):

#     params = (
#         ('printlog', True),
#         ('period', 5),
#     )

#     def next(self):
#         print(self.params.period)

class TestStrategy(bt.Strategy):
     def next(self):
        print(f'Date: {self.datas[0].datetime.date(0)}, Close: {self.datas[0].close[0]}')

# 2. 引擎
cerebro = bt.Cerebro()
# 加策略
cerebro.addstrategy(TestStrategy, period=10)

# 加数据（BackTrader 自带 Yahoo CSV 示例）
data = bt.feeds.YahooFinanceCSVData(
    dataname='orcl-1995-2014.txt',
    fromdate=None,
    todate=None
)

cerebro.adddata(data)

# 5. 1初始资金
cerebro.broker.setcash(100000)
# 5. 1 交易成本（假设万1）
cerebro.broker.setcommission(commission=0.001)
#5.2 滑点（假设万1）
cerebro.broker.set_slippage_perc(perc=0.001)




##仓位控制（固定仓位，每次交易固定数量的股票）
cerebro.addsizer(bt.sizers.FixedSize, stake=10)
##仓位控制 (百分比仓位）
cerebro.addsizer(bt.sizers.PercentSizer, percents=50)


##Analyzer（回测指标）
cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')
##回测结束读取






# 回测以及结果读取
print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
results = cerebro.run()
strat = results[0]
print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())
# print(strat.analyzers.sharpe.get_analysis())
# print(strat.analyzers.drawdown.get_analysis())
# print(strat.analyzers.returns.get_analysis())

cerebro.addobserver(bt.observers.Value)
cerebro.addobserver(bt.observers.Trades)
cerebro.addobserver("最大回撤",bt.observers.DrawDown)

print('画图结果如下',cerebro.plot())