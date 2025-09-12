import pandas as pd
import pandas_market_calendars as mcal

# 读取你的 parquet 文件
df = pd.read_parquet("merged_ultimate.parquet")

# 获取美股交易日历（XNYS）
nyse = mcal.get_calendar('XNYS')
# 生成你数据范围内的所有交易日
all_trade_dates = nyse.valid_days(start_date=str(df['date'].min()), end_date=str(df['date'].max()))
all_trade_dates = pd.to_datetime(all_trade_dates)

# 判断每一行是不是交易日
df['is_actual_data'] = df['date'].isin(all_trade_dates)

# 保存回 parquet
df.to_parquet("merged_ultimate_with_flag.parquet")