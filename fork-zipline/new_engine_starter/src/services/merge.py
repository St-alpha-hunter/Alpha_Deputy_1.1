import pandas as pd
import numpy as np
from typing import Optional
from pandas.tseries.offsets import BDay 


def pit_join_price_funda(
    prices: pd.DataFrame,          # columns: date, ticker, close, ...
    funda: pd.DataFrame,           # columns: announce_date, period_end, ticker, pe, roe, ...
    embargo_bdays: int = 1,         # 发布后延迟X天生效
    max_age_days: Optional[int] = None  # 超过多少天的数据判为过期，置NaN；None表示不限制
) -> pd.DataFrame:
    """
    返回一张“超级宽表”（日频），已按 PIT 原则把季报对齐到每日。
    """
    # 标准化日期
    prices = prices.copy()
    funda = funda.copy()
    prices["date"] = pd.to_datetime(prices["date"]).dt.normalize()
    funda["announce_date"] = pd.to_datetime(funda["filingDate"]).dt.normalize()
    funda["period_end"] = pd.to_datetime(funda["date"]).dt.normalize()

    # 1) 计算生效日（发布+embargo）
    funda["effective_date"] = funda["announce_date"] + BDay(embargo_bdays)
    funda = funda.dropna(subset=["effective_date"])

    # 同一 (symbol, effective_date) 只保留最后一条
    funda = (funda.sort_values(["symbol", "effective_date"])
                  .drop_duplicates(["symbol", "effective_date"], keep="last"))

    # # 2) 排序以便 merge_asof 使用
    # # ✅ 最后一次、用于 asof 的排序 —— 只按 key 列保证全局单调
    # prices     = prices.sort_values(["date"]).reset_index(drop=True)                 # 左：按 left_on 单调
    # funda_keep = funda_keep.sort_values(["effective_date", "symbol"]).reset_index(drop=True)  # 右：按 right_on 单调（次序随意）

    # 3) 只选保留列：右表(财报)的所有财务字段
    # 3) 选择保留列（排除会冲突/无用的右表列）
    exclude = {"symbol", "effective_date", "period_end", "announce_date", "filingDate", "date"}
    keep_cols = ["symbol", "effective_date", "period_end"] + [c for c in funda.columns if c not in exclude]


    funda_keep = funda[keep_cols]
    funda_keep = funda_keep.dropna(subset=["effective_date"])


    # ✅ 关键：再次显式排序，确保右表 keys 有序
    prices = prices.sort_values(["date"]).reset_index(drop=True)
    funda_keep = funda_keep.sort_values(["effective_date","symbol"]).reset_index(drop=True)


    # 4) 分组 asof 合并（按 ticker 对齐，右表用 <=date 的最近一条）
    merged = pd.merge_asof(
        prices, funda_keep,
        by="symbol",
        left_on="date", right_on="effective_date",
        direction="backward",   # 取 <=date 的最近记录 # ← 这里就是控制“向后填充”
        allow_exact_matches=True
    )

    # 5) 可选：限制财务数据的“最大时效”，过期置 NaN（防止久未披露的长期外推）
    if max_age_days is not None:
        age = (merged["date"] - merged["effective_date"]).dt.days
        stale_mask = age > max_age_days
        funda_value_cols = [c for c in merged.columns if c not in prices.columns and c not in ("effective_date","period_end")]
        merged.loc[stale_mask, funda_value_cols] = np.nan

    return merged




# 如果你把 parquet/json 读回来，有些情况下 pandas 会把这些 epoch 毫秒数读成 int64。

# 这时候再用 merged["date"] > "2022-01-01" 就会报错，因为左边是 int，右边是 datetime。

# 解决办法就是在读的时候 pd.to_datetime(df["date"], unit="ms") 转回日期