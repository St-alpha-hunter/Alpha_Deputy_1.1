import pandas as pd
import numpy as np
from tqdm import tqdm

df = pd.read_parquet(r"d:/desktop/practice_dom/FINSHARK/Alpha-Deputy/fork-zipline/new_engine_starter/src/ultimate_data/merged_ultimate.parquet")
date_col = "date"
df[date_col] = pd.to_datetime(df[date_col]).dt.normalize()
groups = df.groupby(df[date_col].dt.date)
for date, group in tqdm(groups, desc="Writing daily panels"):
    file_name = f"d:/desktop/practice_dom/FINSHARK/Alpha-Deputy/fork-zipline/new_engine_starter/src/ultimate_data/panel_data/{date}.parquet"
    group.reset_index(drop=True).to_parquet(file_name, index=False)
