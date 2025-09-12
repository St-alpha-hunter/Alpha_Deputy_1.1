# 因子参数
factors = [

    {
        "name": "6-Month Momentum",
        "code_key": "mom_6m",
        "weight": 0.6281927710843374,
        "code": "momentum_n_months(df, months=6)"
    },

    {
        "name": "Earnings Per Share",
        "code_key": "eps",
        "weight": 0.21,
        "code": "eps(df)"
    },

    {
        "name": "Gross Margin",
        "code_key": "gross_margin",
        "weight": 0.16180722891566265,
        "code": "gross_margin(df)"
    },

]