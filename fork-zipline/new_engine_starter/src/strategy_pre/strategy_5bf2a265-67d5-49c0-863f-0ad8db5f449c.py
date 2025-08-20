from zipline.api import order_target_percent, symbol, set_commission, set_slippage, schedule_function, date_rules, time_rules

def initialize(context):
    # 约束参数
    context.rebalance_freq = "monthly"
    context.max_position_per_chase = 10
    context.risk_free_ratio = 0.0
    context.position_limit = 20
    set_commission(commission.PerShare(0.1))
    set_slippage(slippage.FixedSlippage(0.05))

    # 调度再平衡
    schedule_function(rebalance, date_rules.every_day(), time_rules.market_close())

def rebalance(context, data):
    # 这里只处理约束和下单逻辑
    # stocks = ... # 选股结果由外部传入
    # for stock in stocks:
    #     order_target_percent(stock, 1.0 / len(stocks))

def handle_data(context, data):
    # 处理数据逻辑
    pass