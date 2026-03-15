import os
import sys
import numpy as np
import pandas as pd

FACTOR_PATH_URL = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/price_table")
FACTOR_PATH = os.path.join(FACTOR_PATH_URL, "price_table.parquet")

##确保上游已经完成排序, 这样在计算动量因子时可以更高效地访问数据，不用再针对date排序
def compute_mom_v1(df, window=5):
    df["mom"] = df.groupby("symbol", sort=False)["adjClose"].pct_change(periods=window)
    return df


##直接用 shift + 边界掩码，通常会更快。
def compute_mom_v2(df, window=5):
    s = df["symbol"]
    px = df["adjClose"],df["mom"]

    prev_px = px.shift(window)
###判断当前行的 symbol 和 window 行之前的 symbol 是否相同。
###它返回的是一列 True / False 的布尔数组，用来防止不同股票之间被错误地计算动量。
    same_symbol = s.eq(s.shift(window))

    df["mom"] = np.where(same_symbol, px / prev_px - 1, np.nan)
    return df,df["mom"]

##直接用numpy的方式计算动量因子，通常会更快。
def compute_mom(df, window=5):
    symbols = df["symbol"].to_numpy()
    prices = df["adjClose"].to_numpy(dtype=np.float64)
    out = np.full(len(df), np.nan, dtype=np.float64)
    if len(df) <= window:
        df[f"mom_{window}"] = out
        return df, df[f"mom_{window}"]
    valid = symbols[window:] == symbols[:-window]
    out[window:][valid] = prices[window:][valid] / prices[:-window][valid] - 1.0
    df[f"mom_{window}"] = out
    df.to_parquet(os.path.join(FACTOR_PATH_URL, "price_table.parquet"), index=True)
    return df,df[f"mom_{window}"]



##写入price_table.parquet
##写入alpha_deputy_factor.parquet

if __name__ == "__main__":
    price_table = pd.read_parquet(FACTOR_PATH)
    price_table, mom_factor = compute_mom(price_table, window=5)
    price_table, mom_factor = compute_mom(price_table, window=10)
    price_table, mom_factor = compute_mom(price_table, window=20)
    price_table, mom_factor = compute_mom(price_table, window=60)
    price_table, mom_factor = compute_mom(price_table, window=120)
    price_table, mom_factor = compute_mom(price_table, window=252)
