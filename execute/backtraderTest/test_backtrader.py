import backtrader as bt

# 1. 策略
class TestStrategy(bt.Strategy):
    def next(self):
        print(f'Date: {self.datas[0].datetime.date(0)}, Close: {self.datas[0].close[0]}')

# 2. 引擎
cerebro = bt.Cerebro()

# 3. 加策略
cerebro.addstrategy(TestStrategy)

# 4. 加数据（BackTrader 自带 Yahoo CSV 示例）
data = bt.feeds.YahooFinanceCSVData(
    dataname='orcl-1995-2014.txt',
    fromdate=None,
    todate=None
)

cerebro.adddata(data)

# 5. 初始资金
cerebro.broker.setcash(100000)

# 6. 跑！
print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
cerebro.run()
print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())
