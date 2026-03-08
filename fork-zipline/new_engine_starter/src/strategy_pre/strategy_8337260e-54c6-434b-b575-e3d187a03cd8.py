# 因子参数
factors = [

    {
        "name": "6-Month Momentum",
        "code_key": "mom_6m",
        "weight": 0.5504761904761906,
        "code": "momentum_n_months(df, months=6)"
    },

    {
        "name": "Earnings Per Share",
        "code_key": "eps",
        "weight": 0.32,
        "code": "eps(df)"
    },

    {
        "name": "Gross Margin",
        "code_key": "gross_margin",
        "weight": 0.12952380952380937,
        "code": "gross_margin(df)"
    },

]# 选股参数
number_of_stocks = 5
selected_industries = [

    "Agricultural - Machinery",

    "Agricultural Farm Products",

    "Agricultural Inputs",

    "Financial - Capital Markets",

    "Financial - Conglomerates",

    "Financial - Credit Services",

    "Financial - Diversified",

    "Financial - Data &amp; Stock Exchanges",

    "Financial - Mortgages",

]
max_industry_exposure = 15.0


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

    "Financial - Capital Markets",

    "Financial - Conglomerates",

    "Financial - Credit Services",

    "Financial - Diversified",

    "Financial - Data &amp; Stock Exchanges",

    "Financial - Mortgages",

]
max_industry_exposure = 15.0


# 选股逻辑示例（可根据实际需求替换）
selected_stocks = [

"DFS",

"SYF-PB",

"MRX",

"DEFT",

"SNFCA",

]


# 行业筛选与限制（伪代码）
# selected_stocks = [s for s in all_stocks if s.industry in selected_industries]
# 限制每个行业最大持仓比例
# ...（具体逻辑可根据 max_industry_exposure 实现）

# 最终选出 number_of_stocks 个股票