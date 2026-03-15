import os
import sys

sys.path.append(os.path.abspath(".."))

import argparse
import traceback
import backtrader as bt
from mock_data_feed import feed_data, read_date_from_config
from python_runner.strategy import Strategy

from mock_reader import read_input_json
from mock_writer import write_output_json


output = "mock_output.json"

def main() -> None:
    # parser = argparse.ArgumentParser()
    # parser.add_argument("--input", required=True)
    # parser.add_argument("--output", required=True)
    # parser.add_argument("--task-id", required=True)
    # args = parser.parse_args()
    # print(f"接收到的参数: input={args.input}, output={args.output}, task_id={args.task_id}")
    try:
        # 1. 读取输入文件，准备数据
        config = read_input_json("mock.json")
        startDate, endDate = read_date_from_config(config)
        print(f"读取到的配置文件内容: {config}")
        print(f"开始加载数据，startDate: {startDate}, endDate: {endDate}")

        cerebro = bt.Cerebro()
       

        datas = feed_data(config, startDate, endDate)
        for symbol, data in datas:
            cerebro.adddata(data, name=symbol)

        print(f"共注入 {len(datas)} 个 data feeds")

        # 2. 初始化策略和引擎
        cerebro.addstrategy(Strategy, config=config)
        print("策略添加完成，开始设定外部条件")
        ###设定外部条件,初始资金、手续费、滑点, 是否卖空等
        cerebro.broker.setcash(config["portfolio"]["initialCash"])
        cerebro.broker.setcommission(
            commission=config["execute"]["commissionBps"], 
           # leverage=config["riskManagement"]["maxLeverage"]
            )
        cerebro.broker.set_slippage_perc(perc=config["execute"]["slippageBps"])
        cerebro.broker.set_shortcash(config["execute"]["allowShort"])
        print("外部条件设定完成，开始添加分析器和观察者")

        # 3,添加analyzer
        cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name="sharpe")
        cerebro.addanalyzer(bt.analyzers.DrawDown, _name="drawdown")
        cerebro.addanalyzer(bt.analyzers.Returns, _name="returns")
        # 4,添加observer
        cerebro.addobserver(bt.observers.Value)
        cerebro.addobserver(bt.observers.Trades)
        print("分析器和观察者添加完成，开始回测")
        # 先做假执行，后面再替换成 backtrader_engine.run(spec)
        # 开始回测

        print(f"检查因子打印{datas[0][1].lines.__dict__}")
        print(f"检查因子打印{datas[0][1].params.__dict__}")

        print(f"检查去到的config内容，特别是因子列表和codeKey{config['signal']['inputs']}")
        
        results = cerebro.run()
        print("回测完成，开始处理结果")
        print(f"results = {results}")
        print(f"结果长度len(results) = {len(results)}")
        strat = results[0]
        result = {
            "success": True,
            "message": f"python runner received task",
            "metrics": {
                ###添加分析器，比如夏普比率、最大回撤、收益率等
                "sharpe 夏普比率": strat.analyzers.sharpe.get_analysis(),
                "maxDrawdown 最大回撤": strat.analyzers.drawdown.get_analysis(),
                "returns 累计收益率": strat.analyzers.returns.get_analysis(),
            },
            # "Observations": {
            #     "portfolio_value 组合价值": strat.observers.Value,
            #     "trades 交易记录": strat.observers.Trades,
            # },
            # "equityCurve": [
            #     {"date": , "value": 1000000},
            #     {"date": , "value": 1005000}
            # ],
            "tradeList": [],
            "rawSpec": config
        }

        write_output_json(output, result)

    except Exception as ex:
        error_result = {
            "success": False,
            "message": str(ex),
            "traceback": traceback.format_exc(),
        }
        write_output_json(output, error_result)
        print(f"文件已写入路径args.output = {output}")
        raise

if __name__ == "__main__":
    main()