import pandas as pd
from functools import partial
# def compute_factor(code_key: str, df: pd.DataFrame, computeCode) -> pd.Series:
#     if code_key not in REGISTRY:
#         raise ValueError(f"Unknown factor: {code_key}")
#     return REGISTRY[code_key](df, computeCode)

#o	（推荐）元数据：min_bars、na_policy("keep"/"ffill")，稳健性写在因子里，因子自洽。import pandas as pd


def momentum_n_months(df: pd.DataFrame, months: int, exclude_recent_days: int = 0) -> pd.Series:
    """
    计算过去 N 个月的动量（累计收益率），可选排除最近几天
    """
    window = months * 21  # 1个月约21交易日
    if exclude_recent_days > 0:
        shifted = df["close"].shift(exclude_recent_days)
    else:
        shifted = df["close"]
    # 动量 = 当前价 / N个月前价 - 1
    momentum = shifted / shifted.shift(window) - 1
    # 可选：对极端值做 winsorize 或 clip
    return momentum.clip(-1, 1)  # 防止极端异常

#向后填充（ffill）保证每期有值

def gross_margin(df: pd.DataFrame, window: int = 4) -> pd.Series:
    gm = df["grossProfit"].ffill() / df["revenue"].ffill()
    return gm.rolling(window, min_periods=1).mean().clip(-1, 1)

def net_margin(df: pd.DataFrame, window: int = 4) -> pd.Series:
    nm = df["netIncome"].ffill() / df["revenue"].ffill()
    return nm.rolling(window, min_periods=1).mean().clip(-1, 1)

def eps(df: pd.DataFrame, window: int = 4) -> pd.Series:
    return df["eps"].ffill().rolling(window, min_periods=1).mean().clip(-100, 100)

REGISTRY = {
    "mom_3m": partial(momentum_n_months, months=3),
    "mom_6m": partial(momentum_n_months, months=6),
    "mom_9m": partial(momentum_n_months, months=9),
    "mom_12m": partial(momentum_n_months, months=12),
    "gross_margin": gross_margin,
    "net_margin": net_margin,
    "eps": eps,
}