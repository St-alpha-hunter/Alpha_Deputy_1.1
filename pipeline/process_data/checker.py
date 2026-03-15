import pandas as pd

# def check_daily_data(df: pd.DataFrame) -> pd.DataFrame:
#     """
#     Standardize raw FMP data to uniform column format.

#     Expected input: DataFrame with raw FMP fields.
#     Output: Columns ['date', 'symbol', 'adjOpen', 'adjHigh', 'adjLow', 'adjClose', 'volume', 'dividend', 'split_ratio']
#     """
#     # 确保基础字段存在（FMP里有）
#     expected_cols = ["date", "symbol", "adjOpen", "adjHigh", "adjLow", "adjClose", "volume"]
#     # 筛选字段，避免缺字段导致错误
#     df = df[[col for col in expected_cols if col in df.columns]]
#     data_cols = ["adjOpen", "adjHigh", "adjLow", "adjClose", "volume"]
#     # 基础检验
#     for col in data_cols:
#         if col not in df.columns:
#             df[col] = 0.0
#             raise ValueError(f"Missing expected column: {col}")
#     #逻辑检验
#     ##最高价格小于最低价
#     if (df["adjHigh"] < df["adjLow"]).any():
#         raise ValueError("Data error: adjHigh is less than adjLow for some rows.")
#     ##收盘价不在最高价和最低价之间
#     if (df["adjClose"] < df["adjLow"]).any() or (df["adjClose"] > df["adjHigh"]).any():
#         raise ValueError("Data error: adjClose is outside the range of adjLow and adjHigh for some rows.")
#     ##开盘价不在最高价和最低价之间
#     if (df["adjOpen"] < df["adjLow"]).any() or (df["adjOpen"] > df["adjHigh"]).any():
#         raise ValueError("Data error: adjOpen is outside the range of adjLow and adjHigh for some rows.")
#     if (df["volume"] < 0).any():
#         raise ValueError("Data error: volume contains negative values.")
#     df = df[expected_cols]
#     return df

def check_daily_data(df: pd.DataFrame):
    if df is None:
        return [{"issue_type": "null_df", "detail": "Input df is None"}]

    if not isinstance(df, pd.DataFrame):
        return [{"issue_type": "invalid_type", "detail": f"Expected DataFrame, got {type(df)}"}]

    if df.empty:
        return [{"issue_type": "empty_df", "detail": "Input DataFrame is empty"}]

    issues = []
    expected_cols = ["date", "symbol", "adjOpen", "adjHigh", "adjLow", "adjClose", "volume"]
    missing_cols = [c for c in expected_cols if c not in df.columns]
    if missing_cols:
        issues.append({
            "issue_type": "missing_columns",
            "rows": None,
            "detail": f"Missing columns: {missing_cols}"
        })
        return issues

    bad_high_low = df[df["adjHigh"] < df["adjLow"]]
    if not bad_high_low.empty:
        issues.append({
            "issue_type": "high_below_low",
            "rows": bad_high_low.index.tolist(),
            "detail": f"{len(bad_high_low)} rows where adjHigh < adjLow"
        })

    bad_close = df[(df["adjClose"] < df["adjLow"]) | (df["adjClose"] > df["adjHigh"])]
    if not bad_close.empty:
        issues.append({
            "issue_type": "close_out_of_range",
            "rows": bad_close.index.tolist(),
            "detail": f"{len(bad_close)} rows where adjClose خارج range"
        })

    bad_open = df[(df["adjOpen"] < df["adjLow"]) | (df["adjOpen"] > df["adjHigh"])]
    if not bad_open.empty:
        issues.append({
            "issue_type": "open_out_of_range",
            "rows": bad_open.index.tolist(),
            "detail": f"{len(bad_open)} rows where adjOpen outside range"
        })

    bad_volume = df[df["volume"] < 0]
    if not bad_volume.empty:
        issues.append({
            "issue_type": "negative_volume",
            "rows": bad_volume.index.tolist(),
            "detail": f"{len(bad_volume)} rows where volume < 0"
        })

    return issues

