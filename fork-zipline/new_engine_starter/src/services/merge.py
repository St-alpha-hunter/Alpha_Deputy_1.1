import pandas as pd
import numpy as np
from typing import Optional
from pandas.tseries.offsets import BDay


def pit_join_price_funda(
    prices: pd.DataFrame,           # columns: date, symbol, close, ...
    funda: pd.DataFrame,            # columns: filingDate, date, symbol, pe, roe, ...
    embargo_bdays: int = 1,         # 发布后延迟X天生效
    max_age_days: Optional[int] = None  # 超过多少天的数据判为过期，置NaN；None表示不限制
) -> pd.DataFrame:
    """
    返回一张“超级宽表”（日频），已按 PIT 原则把季报对齐到每日。
    """

    # 复制以防副作用
    prices = prices.copy()
    funda = funda.copy()

    # 日期标准化
    prices["date"] = pd.to_datetime(prices["date"]).dt.tz_localize(None)
    funda["announce_date"] = pd.to_datetime(funda["filingDate"]).dt.tz_localize(None)
    funda["period_end"] = pd.to_datetime(funda["date"]).dt.tz_localize(None)

    # 类型统一（避免 category merge 错误）
    prices["symbol"] = prices["symbol"].astype(str)
    prices = prices[prices["symbol"].str.match(r"^[A-Z\-]+$")]
    funda["symbol"] = funda["symbol"].astype(str)

    # 生效日 = 公告日 + 延迟
    funda["effective_date"] = funda["announce_date"] + BDay(embargo_bdays)
    prices = prices.dropna(subset=["symbol"])
    funda = funda.dropna(subset=["effective_date"])

    # 只保留每个 symbol 在每个生效日的最新记录
    funda = (funda.sort_values(["symbol", "effective_date"])
                  .drop_duplicates(["symbol", "effective_date"], keep="last"))

    # 选择合并字段（可自定义/全保留）funda保留的字段在哪里
    exclude = {"symbol", "effective_date", "period_end", "announce_date", "filingDate", "date"}
    keep_cols = ["symbol", "effective_date", "period_end"] + [
        col for col in funda.columns if col not in exclude
    ]
    funda_keep = funda[keep_cols]

    # 类型 & 排序：确保 merge_asof 能跑通
    funda_keep["effective_date"] = pd.to_datetime(funda_keep["effective_date"]).dt.tz_localize(None)
    prices = prices.sort_values(["symbol", "date"],ascending=[True, True]).reset_index(drop=True)
    funda_keep = funda_keep.sort_values(["symbol","effective_date"],ascending=[True, True]).reset_index(drop=True)

    ###
    min_price_date = prices["date"].min()
    funda_keep = funda_keep[funda_keep["effective_date"] >= min_price_date]
    # prices["symbol"] = prices["symbol"].astype(str)
    # funda_keep["symbol"] = funda_keep["symbol"].astype(str)

    # prices["symbol"] = prices["symbol"].str.strip().str.upper()
    # funda_keep["symbol"] = funda_keep["symbol"].str.strip().str.upper()

    # 打印检查
    print("📆 price dtype:", prices["date"].dtype)
    print("📆 funda dtype:", funda_keep["effective_date"].dtype)
    print("🗓️ Prices max date:", prices["date"].max())
    print("🗓️ Funda effective max date:", funda_keep["effective_date"].max())


    # 检查是否严格升序
    print("检查 prices 排序：")
    print(prices[["symbol", "date"]].head(10))
    print(prices[["symbol", "date"]].tail(10))


    prices = prices.dropna(subset=["symbol","date"])
    funda_keep = funda_keep.dropna(subset=["effective_date","symbol"])


    print("Prices symbols:", prices["symbol"].unique())
    print("Funda symbols:", funda_keep["symbol"].unique())
    print("Prices date range:", prices["date"].min(), prices["date"].max())
    print("Funda effective_date range:", funda_keep["effective_date"].min(), funda_keep["effective_date"].max())
    print("Funda_keep sample:")
    print(funda_keep.head())



    # 合并（按 symbol + date 对齐）
    merged = pd.merge_asof(
        prices, funda_keep,
        by="symbol",
        left_on="date", 
        right_on="effective_date",
        direction="backward",
        allow_exact_matches=True
    )

    # 可选：限制最大时效
    if max_age_days is not None:
        age = (merged["date"] - merged["effective_date"]).dt.days
        stale_mask = age > max_age_days
        funda_value_cols = [
            c for c in merged.columns
            if c not in prices.columns and c not in ("effective_date", "period_end")
        ]
        merged.loc[stale_mask, funda_value_cols] = np.nan

    return merged




# 如果你把 parquet/json 读回来，有些情况下 pandas 会把这些 epoch 毫秒数读成 int64。

# 这时候再用 merged["date"] > "2022-01-01" 就会报错，因为左边是 int，右边是 datetime。

# 解决办法就是在读的时候 pd.to_datetime(df["date"], unit="ms") 转回日期