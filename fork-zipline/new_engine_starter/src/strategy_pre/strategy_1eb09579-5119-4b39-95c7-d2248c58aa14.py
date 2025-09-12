# 因子参数
factors = [

    {
        "name": "6-Month Momentum",
        "code_key": "mom_6m",
        "weight": 0.5587654320987654,
        "code": "momentum_n_months(df, months=6)"
    },

    {
        "name": "Earnings Per Share",
        "code_key": "eps",
        "weight": 0.27,
        "code": "eps(df)"
    },

    {
        "name": "Net Margin",
        "code_key": "net_margin",
        "weight": 0.17123456790123456,
        "code": "net_margin(df)"
    },

]# 选股参数
number_of_stocks = 3
selected_industries = [

    "Agricultural - Machinery",

    "Agricultural Farm Products",

    "Agricultural Inputs",

    "Banks",

    "Banks - Diversified",

]
max_industry_exposure = 50.0


# 选股逻辑示例（可根据实际需求替换）
selected_stocks = [

]


# 行业筛选与限制（伪代码）
# selected_stocks = [s for s in all_stocks if s.industry in selected_industries]
# 限制每个行业最大持仓比例
# ...（具体逻辑可根据 max_industry_exposure 实现）

# 最终选出 number_of_stocks 个股票# 选股参数
number_of_stocks = 3
selected_industries = [

    "Agricultural - Machinery",

    "Agricultural Farm Products",

    "Agricultural Inputs",

    "Banks",

    "Banks - Diversified",

]
max_industry_exposure = 50.0


# 选股逻辑示例（可根据实际需求替换）
selected_stocks = [

"IPI",

"EWBC",

"LND",

]


# 行业筛选与限制（伪代码）
# selected_stocks = [s for s in all_stocks if s.industry in selected_industries]
# 限制每个行业最大持仓比例
# ...（具体逻辑可根据 max_industry_exposure 实现）

# 最终选出 number_of_stocks 个股票##执行回测
from zipline.api import order_target_percent, symbol, set_commission, set_slippage, schedule_function, date_rules, set_benchmark, time_rules
from zipline.finance import commission, slippage
from zipline.utils.calendar_utils import get_calendar
from zipline.pipeline.filters import StaticAssets
from zipline.pipeline import Pipeline
from zipline.pipeline.factors import SimpleMovingAverage
from zipline.utils.events import date_rules, time_rules
from zipline.api import get_datetime
from zoneinfo import ZoneInfo
import pandas as pd
import datetime
import pytz
import os


# 提前准备季度调仓日期列表（季度首月第一个交易日）
QUARTERLY_REBALANCE_DATES = set()
tz = ZoneInfo("UTC")
calendar = get_calendar('XNYS')
calendar.tz = tz 
start = datetime.datetime(2000, 1, 1)
end = datetime.datetime(2026, 9, 2)
all_sessions = calendar.sessions_in_range(start, end)


for year in range(2000, 2031):
    for month in [1, 4, 7, 10]: # 每个季度的第一个月
        first_day = all_sessions[(all_sessions.year == year) & (all_sessions.month == month)]
        if not first_day.empty:
            QUARTERLY_REBALANCE_DATES.add(first_day[0].date())


def initialize(context):
    # 约束参数
    context.session_id = "" 
    context.rebalance_freq = "monthly" ##调仓频率
    context.max_position_per_chase = 5 ###单次追单最大仓位
    context.risk_free_ratio = 20.0 ###无风险资金比例
    context.position_limit = 20 ###最大仓位
    set_commission(commission.PerShare(0.1)) ##手续费
    set_slippage(slippage.FixedSlippage(0.05)) ##滑点
    set_benchmark(symbol('SPY')) # 设置基准
    # 调度再平衡
    
    schedule_function(
        rebalance,
        decide_rebalance_feq(context.rebalance_freq), ###写一个函数，根据User选择的调仓决定week_start,还是month_start
        time_rules.market_close()
    )
    
    
def decide_rebalance_feq(freq):
    if freq == "daily":
        return date_rules.every_day()
    elif freq == "weekly":
        return date_rules.week_start()
    elif freq == "monthly":
        return date_rules.month_start()
    elif freq == "quarterly":
        return date_rules.every_day()
    else:
        raise ValueError(f"Unknown rebalance frequency: {freq}")
    


def rebalance(context, data):
    if not context.selected:
        return

    if context.rebalance_freq == "quarterly":
        today = get_datetime().date()
        if today not in QUARTERLY_REBALANCE_DATES:
            return # 非季度调仓日，不执行

    # 保留无风险资金比例
    total_value = context.portfolio.portfolio_value
    investable_value = total_value * (1 - context.risk_free_ratio)

   
    for stock in context.portfolio.positions:
        if stock.symbol not in [s.symbol for s in context.selected]:
            order_target_percent(stock, 0) # 卖出未入选股票
    
    # 等权买入
    num_stocks = len(context.selected)
    target_weight = (investable_value / total_value) / num_stocks if num_stocks > 0 else 0

    for stock in context.selected:
        if data.can_trade(stock):
            order_target_percent(stock, weight) # 均等权买入
    
    
from strategy.stock_selector import select_stocks
import pandas as pd
    

def before_trading_start(context, data):
    today = get_datetime().normalize().date()
    
    date = today.strftime("%Y-%m-%d")
    panel_path = f"d:\\desktop\\practice_dom\\FINSHARK\\Alpha-Deputy\\fork-zipline\\new_engine_starter\\src\\ultimate_data\\panel\\{date}.parquet"
    if not os.path.exists(panel_path):
        context.selected = []
        context.selected_symbols = []
        return
    
    panel_today = pd.read_csv(panel_path)
    
    # 调用外部选股模块
    selected_symbols = select_stocks(panel_today, context.session_id)
        
    context.selected_symbols = selected_symbols
    context.selected = [symbol(sym) for sym in selected_symbols]