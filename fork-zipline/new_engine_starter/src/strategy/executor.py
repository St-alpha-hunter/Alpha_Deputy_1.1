"""
模块说明：executor.py

职责：
    - 封装 zipline 的回测调用逻辑
    - 动态加载策略 .py 文件，提取 initialize / handle_data 函数
    - 使用 zipline.run_algorithm 执行策略
    - 返回回测结果（净值、指标、图表等）

使用方式：
    - 输入参数：策略文件路径、回测时间段、初始资金等
    - 输出：回测结果 dataframe，可用于生成图表 / JSON 返回

TODO：
    [ ] 实现：execute_strategy(strategy_path, start_date, end_date, ...)
    [ ] 支持异常处理，如策略文件无效、时间不合法等
    [ ] 支持结果图像生成（base64）或结构化回测指标
    [ ] 后续可对接报告归档模块
"""

import os
import sys
import pandas as pd
from pathlib import Path
import importlib.util
from zipline.api import order_target_percent, symbol, schedule_function, date_rules, time_rules, set_benchmark
from zipline.pipeline import Pipeline
from zipline.pipeline.data import Fundamentals
from zipline.pipeline.factors import SimpleMovingAverage, Returns
from zipline.pipeline.filters import QTradableStocksUS
from zipline import run_algorithm
from zipline.utils.calendar_utils import get_calendar
from zipline.pipeline.engine import attach_pipeline, pipeline_output
import pandas as pd
import datetime
import pytz


###########仅仅用来演示，run_algorithm的回测我放在了routes.py

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

strategy_file_path = os.path.join(BASE_DIR, "..", "strategy_pre", f"strategy_{session_id}.py")


# 加载动态策略代码（rendered from Jinja）
spec = importlib.util.spec_from_file_location("strategy", strategy_file_path)
strategy_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(strategy_module)


# 运行回测
run_algorithm(
    start=pd.Timestamp("2020-08-06", tz="UTC"),
    end=pd.Timestamp("2022-12-31", tz="UTC"),
    initialize=strategy_module.initialize,
    before_trading_start=strategy_module.before_trading_start,
    handle_data=strategy_module.handle_data if hasattr(strategy_module, "handle_data") else None,
    capital_base=1e6,
    data_frequency="daily",
    trading_calendar= get_calendar("XNYS")
)