import pandas as pd

# 读取原始 parquet 文件
df = pd.read_parquet(r"d:/desktop/practice_dom/FINSHARK/Alpha-Deputy/fork-zipline/new_engine_starter/src/ultimate_data/merged_ultimate_with_flag.parquet")

# 只保留指定列
cols = [
    "date", "symbol", "open", "high", "low", "close", "volume",
    "effective_date", "period_end", "reportedCurrency", "cik",
    "acceptedDate", "fiscalYear", "period", "grossProfit",
    "revenue", "netIncome", "is_actual_data"
]
df = df[cols]

# 保存为新 parquet 文件
df.to_parquet(r"d:/desktop/practice_dom/FINSHARK/Alpha-Deputy/fork-zipline/new_engine_starter/src/ultimate_data/merged_ultimate_with_flag_trimmed.parquet")