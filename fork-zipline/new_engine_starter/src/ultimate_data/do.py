##执行回测
from zipline.api import order_target_percent, symbol, set_commission, set_slippage, schedule_function, date_rules, set_benchmark, time_rules
from zipline.finance import commission, slippage
from zipline.utils.calendar_utils import get_calendar
from zipline.pipeline.filters import StaticAssets
from zipline.pipeline import Pipeline
from zipline.pipeline.factors import SimpleMovingAverage
from zipline.utils.events import date_rules, time_rules
from zipline.api import get_datetime
import pandas as pd
import datetime
import pytz
import os


# 提前准备季度调仓日期列表（季度首月第一个交易日）
QUARTERLY_REBALANCE_DATES = set()
calendar = get_calendar('XNYS')
print("calendar.tz type 日历类型是啥呢:", type(calendar.tz), calendar.tz)
start = datetime.datetime(2000, 1, 1)
end = datetime.datetime(2026, 9, 2)
all_sessions = calendar.sessions_in_range(start, end)

print("calendar.tz type 日历类型是啥呢:", type(calendar.tz), calendar.tz)