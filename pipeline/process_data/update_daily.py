##每天更新 按symbol 更新 data/divide_symbol下的
##每天更新 按date 更新 data/divide_date下的
##用Checker

##把 divide_symbol 当主库，divide_date 当派生库。
import os
from pathlib import Path
import time
import logging
from anyio import Path
import pandas as pd
import requests
from dotenv import load_dotenv
from tqdm import tqdm
from datetime import datetime
#拉取函数
from .fetch_data import read_symbols_from_file, load_fmp_bulk_data
##检验函数
from .checker import check_daily_data


load_dotenv()
API_KEY = os.getenv("FMP_API_KEY")
log = logging.getLogger(__name__)
if not API_KEY:
    raise ValueError("FMP_API_KEY not set in .env or environment.")

Read_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "divide_date")
Save_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw_divide_symbol")

FMP_DATA_URL = "https://financialmodelingprep.com/stable/historical-price-eod/dividend-adjusted?symbol={symbol}&from={from_date}&to={to_date}&apikey={apikey}"


##读取日期
def read_date_from_parquet(file_path, lookback_files=5):
    files = [f[:-8] for f in os.listdir(file_path) if f.endswith(".parquet")]
    if not files:
        raise ValueError(f"No parquet files found in {file_path}")
    idx = max(0, len(files) - lookback_files)
    target = files[idx]

    startDate = f"{target[:4]}-{target[4:6]}-{target[6:8]}"
    return startDate


def get_today_date_str():
    """返回今天日期，格式 YYYY-MM-DD"""
    today = datetime.today()
    endDate = today.strftime("%Y-%m-%d")
    return endDate


if __name__ == "__main__":
    startDate = read_date_from_parquet(Read_dir, lookback_files=5)
    #ookback_files=5 想从几期之前去拉，lokkback_files=0 就是从最新的文件去拉，lookback_files=1 就是从倒数第二个文件去拉，以此类推。
    endDate = get_today_date_str()
    print(f"更新数据，日期范围: {startDate} to {endDate}")
    symbols = read_symbols_from_file()
    df = load_fmp_bulk_data(symbols, startDate, endDate)
