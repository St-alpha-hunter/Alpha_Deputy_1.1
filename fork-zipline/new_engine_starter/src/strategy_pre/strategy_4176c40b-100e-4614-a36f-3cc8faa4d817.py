# 因子参数
factors = [

    {
        "name": "9-Month Momentum",
        "code_key": "mom_9m",
        "weight": 0.8,
        "code": "momentum_n_months(df, months=9)"
    },

    {
        "name": "Net Margin",
        "code_key": "net_margin",
        "weight": 0.19999999999999996,
        "code": "net_margin(df)"
    },

]# 选股参数
number_of_stocks = 6
selected_industries = [

    "Agricultural - Machinery",

    "Aerospace &amp; Defense",

    "Advertising Agencies",

    "Agricultural Farm Products",

    "Agricultural Inputs",

]
max_industry_exposure = 45.0


# 选股逻辑示例（可根据实际需求替换）
selected_stocks = [

]


# 行业筛选与限制（伪代码）
# selected_stocks = [s for s in all_stocks if s.industry in selected_industries]
# 限制每个行业最大持仓比例
# ...（具体逻辑可根据 max_industry_exposure 实现）

# 最终选出 number_of_stocks 个股票