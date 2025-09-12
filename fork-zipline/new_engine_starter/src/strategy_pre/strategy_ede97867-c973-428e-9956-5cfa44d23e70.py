# 因子参数
factors = [

    {
        "name": "6-Month Momentum",
        "code_key": "mom_6m",
        "weight": 0.19,
        "code": "momentum_n_months(df, months=6)"
    },

    {
        "name": "Earnings Per Share",
        "code_key": "eps",
        "weight": 0.62,
        "code": "eps(df)"
    },

    {
        "name": "Net Margin",
        "code_key": "net_margin",
        "weight": 0.19,
        "code": "net_margin(df)"
    },

]# 选股参数
number_of_stocks = 5
selected_industries = [

    "Agricultural - Machinery",

    "Agricultural Farm Products",

    "Agricultural Inputs",

    "Asset Management - Cryptocurrency",

    "Asset Management - Global",

    "Asset Management - Income",

    "Financial - Capital Markets",

    "Financial - Conglomerates",

    "Financial - Credit Services",

    "Financial - Data &amp; Stock Exchanges",

    "Financial - Diversified",

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
number_of_stocks = 5
selected_industries = [

    "Agricultural - Machinery",

    "Agricultural Farm Products",

    "Agricultural Inputs",

    "Asset Management - Cryptocurrency",

    "Asset Management - Global",

    "Asset Management - Income",

    "Financial - Capital Markets",

    "Financial - Conglomerates",

    "Financial - Credit Services",

    "Financial - Data &amp; Stock Exchanges",

    "Financial - Diversified",

]
max_industry_exposure = 50.0


# 选股逻辑示例（可根据实际需求替换）
selected_stocks = [

]


# 行业筛选与限制（伪代码）
# selected_stocks = [s for s in all_stocks if s.industry in selected_industries]
# 限制每个行业最大持仓比例
# ...（具体逻辑可根据 max_industry_exposure 实现）

# 最终选出 number_of_stocks 个股票