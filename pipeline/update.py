import os
import pandas as pd
from process_data.merge_divide_date import divide_data_by_symbol

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data/price_table")

if __name__ == "__main__":
    price_df = pd.read_parquet(os.path.join(BASE, "price_table.parquet"))
    divide_data_by_symbol(price_df)
    print("已完成切分")