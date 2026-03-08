# 因子参数
factors = [

    {
        "name": "Gross Margin",
        "code_key": "gross_margin",
        "weight": 0.65,
        "code": "gross_margin(df)"
    },

    {
        "name": "12-Month Momentum",
        "code_key": "mom_12m",
        "weight": 0.35,
        "code": "momentum_n_months(df, months=12)"
    },

]# 选股参数
number_of_stocks = 6
selected_industries = [

    "Agricultural Farm Products",

    "Agricultural - Machinery",

    "Aerospace &amp; Defense",

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