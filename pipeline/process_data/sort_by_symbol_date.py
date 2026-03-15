import numpy as np
import pandas as pd
import os

SORT_DIVIDE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/raw_divide_symbol")
SORT_PRICE_TABLE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/price_table")
SORT_ALHPA_DEPUTY_FACTOR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/alpha_deputy_factor")


def sort_data_by_sybmol_date(input_dir, output_dir):
    """
    将按日期分割的每日数据文件进行排序，确保每个文件内的数据按照股票代码排序
    这样在后续计算因子时可以更高效地访问数据
    """
    for file_name in os.listdir(input_dir):
        if file_name.endswith(".parquet"):
            file_path = os.path.join(input_dir, file_name)
            df = pd.read_parquet(file_path)
            df.sort_values(["symbol","date"], inplace=True)
            output_path = os.path.join(output_dir, file_name)
            df.to_parquet(output_path)
            print(f"已排序并保存: {output_path}")
            

if __name__ == "__main__":
    sort_data_by_sybmol_date(SORT_DIVIDE_PATH, SORT_DIVIDE_PATH)
    sort_data_by_sybmol_date(SORT_PRICE_TABLE, SORT_PRICE_TABLE)
    sort_data_by_sybmol_date(SORT_ALHPA_DEPUTY_FACTOR, SORT_ALHPA_DEPUTY_FACTOR)