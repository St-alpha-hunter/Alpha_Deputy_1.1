import pandas as pd
from functools import partial
# def compute_factor(code_key: str, df: pd.DataFrame, computeCode) -> pd.Series:
#     if code_key not in REGISTRY:
#         raise ValueError(f"Unknown factor: {code_key}")
#     return REGISTRY[code_key](df, computeCode)

#o	（推荐）元数据：min_bars、na_policy("keep"/"ffill")，稳健性写在因子里，因子自洽。import pandas as pd

##辅助函数
def safe_rolling_mean(series: pd.Series, effective_date: pd.Series, max_window: int = 5, min_window: int = 3) -> pd.Series:
    report_mask = effective_date != effective_date.shift(1)
    report_idx = series.index[report_mask]
    # 只对有效财报日做 rolling
    valid_series = series[report_mask]
    n = len(valid_series)
    result = pd.Series([float("nan")] * len(series), index=series.index)
    if n < min_window:
        return result
    else:
        window = max(min(n, max_window), min_window)
        rolled = valid_series.rolling(window, min_periods=1).mean()
        result.loc[report_idx] = rolled.values
        return result.ffill()


def momentum_n_months(df: pd.DataFrame, months: int, exclude_recent_days: int = 0) -> pd.Series:
    """
    计算过去 N 个月的动量（累计收益率），可选排除最近几天
    """
    df = df[df["is_actual_data"] == True].copy()
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

def gross_margin(df: pd.DataFrame, max_window: int = 5, min_window: int = 3) -> pd.Series:
    gm = df["grossProfit"].ffill() / df["revenue"].ffill()
    return safe_rolling_mean(gm, max_window, min_window).clip(-1, 1)

def net_margin(df: pd.DataFrame, max_window: int = 5, min_window: int = 3) -> pd.Series:
    nm = df["netIncome"].ffill() / df["revenue"].ffill()
    return safe_rolling_mean(nm, max_window, min_window).clip(-1, 1)

def eps(df: pd.DataFrame, max_window: int = 5, min_window: int = 3) -> pd.Series:
    return safe_rolling_mean(df["eps"].ffill(), max_window, min_window).clip(-100, 100)


FACTOR_META = {
    "mom_3m": {"fields": ["close"]},
    "mom_6m": {"fields": ["close"]},
    "mom_9m": {"fields": ["close"]},
    "mom_12m": {"fields": ["close"]},
    "gross_margin": {"fields": ["grossProfit", "revenue", "effective_date"]},
    "net_margin": {"fields": ["netIncome", "revenue", "effective_date"]},
    "eps": {"fields": ["eps", "effective_date"]},
}


REGISTRY = {
    "mom_3m": partial(momentum_n_months, months=3),
    "mom_6m": partial(momentum_n_months, months=6),
    "mom_9m": partial(momentum_n_months, months=9),
    "mom_12m": partial(momentum_n_months, months=12),
    "gross_margin": gross_margin,
    "net_margin": net_margin,
    "eps": eps,
}

def get_required_fields(factor_keys):
    fields = set()
    for key in factor_keys:
        fields.update(FACTOR_META.get(key, {}).get("fields", []))
    return list(fields)


if __name__ == "__main__":
    import pandas as pd
    import numpy as np

    effective_dates = [np.nan]*10 + ["2024-01-01"] + [np.nan]*20 + ["2024-04-01"] + [np.nan]*30 + ["2024-07-01"] + [np.nan]*28 + ["2024-10-01"]
    effective_dates += [np.nan] * (100 - len(effective_dates))  # 补齐到100
    # 用例1：正常财报日分布
    df1 = pd.DataFrame({
        "close": np.linspace(100, 110, 100),
        "grossProfit": np.linspace(10, 20, 100),
        "revenue": np.linspace(20, 40, 100),
        "netIncome": np.linspace(5, 10, 100),
        "eps": np.linspace(1, 2, 100),
        "effective_date": effective_dates
    })
    print("=== 用例1：正常财报日分布 ===")
    print("mom_3m:", REGISTRY["mom_3m"](df1))
    print("gross_margin:", REGISTRY["gross_margin"](df1, df1["effective_date"]))
    print("net_margin:", REGISTRY["net_margin"](df1, df1["effective_date"]))
    print("eps:", REGISTRY["eps"](df1, df1["effective_date"]))

    # 用例2：只有一个财报日
    df2 = pd.DataFrame({
        "close": np.random.rand(10) * 100,
        "grossProfit": np.random.rand(10) * 10,
        "revenue": np.random.rand(10) * 20,
        "netIncome": np.random.rand(10) * 5,
        "eps": np.random.rand(10),
        "effective_date": [np.nan]*9 + ["2024-12-31"]
    })
    print("\n=== 用例2：只有一个财报日 ===")
    print("gross_margin:", REGISTRY["gross_margin"](df2, df2["effective_date"]))

    # 用例3：连续财报日（每行都是财报日）
    df3 = pd.DataFrame({
        "close": np.random.rand(10) * 100,
        "grossProfit": np.random.rand(10) * 10,
        "revenue": np.random.rand(10) * 20,
        "netIncome": np.random.rand(10) * 5,
        "eps": np.random.rand(10),
        "effective_date": [f"2024-01-{str(i+1).zfill(2)}" for i in range(10)]
    })
    print("\n=== 用例3：连续财报日 ===")
    print("gross_margin:", REGISTRY["gross_margin"](df3, df3["effective_date"]))

    # 用例4：全部没有财报日
    df4 = pd.DataFrame({
        "close": np.random.rand(10) * 100,
        "grossProfit": np.random.rand(10) * 10,
        "revenue": np.random.rand(10) * 20,
        "netIncome": np.random.rand(10) * 5,
        "eps": np.random.rand(10),
        "effective_date": [np.nan]*10
    })
    print("\n=== 用例4：全部没有财报日 ===")
    print("gross_margin:", REGISTRY["gross_margin"](df4, df4["effective_date"]))