import backtrader as bt
import pandas as pd

cerebro = bt.Cerebro()





"""
优化器，目前只是一个概念模型
"""





class MomentumStrategy(bt.Strategy):
    params = (
        ("lookback", 20),
        ("topk", 20),
    )

    def __init__(self):
        self.momentum = self.datas[0].close - self.datas[0].close(-self.params.lookback)

    def next(self):
        if len(self) < self.params.lookback:
            return

        # 获取当前时刻的动量值
        momentum_values = self.momentum.get(size=self.params.lookback)
        symbols = [d._name for d in self.datas]

        # 将动量值和对应的股票代码打包成列表，并按照动量值排序
        momentum_with_symbols = sorted(zip(momentum_values, symbols), reverse=True)

        # 选取动量值最高的 topk 个股票进行买入
        for i in range(self.params.topk):
            symbol = momentum_with_symbols[i][1]
            data = self.getdatabyname(symbol)
            if not self.getposition(data).size:
                self.buy(data=data)


cerebro.optstrategy()
cerebro.optstrategy(
    MomentumStrategy,
    lookback=range(10, 60, 10),
    topk=[10, 20, 30]
)
