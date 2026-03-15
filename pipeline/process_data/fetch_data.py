import os
from pathlib import Path
import time
import logging
import datetime
from anyio import Path
from numpy import full
import pandas as pd
import requests
from dotenv import load_dotenv
from tqdm import tqdm

##检验函数
from .checker import check_daily_data

load_dotenv()
API_KEY = os.getenv("FMP_API_KEY")
log = logging.getLogger(__name__)
if not API_KEY:
    raise ValueError("FMP_API_KEY not set in .env or environment.")


ONE_MEGABYTE = 1024 * 1024
FMP_DATA_URL = "https://financialmodelingprep.com/stable/historical-price-eod/dividend-adjusted?symbol={symbol}&from={from_date}&to={to_date}&apikey={apikey}"


#存储目录
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
##一个os.path.dirname就是所在目录，再往上就是 所在目录的 父目录
os.makedirs(CACHE_DIR, exist_ok=True)
OUTPUT_PATH = os.path.join(CACHE_DIR, "raw_divide_symbol")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SYMBOLS_FILE = os.path.join(PROJECT_ROOT, "symbols/symbols_sp500.txt")

BIG_FACTOR_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/price_table")
PRICE_TABLE = os.path.join(BIG_FACTOR_PATH, "price_table.parquet")

FACTOR_PATH_URL = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/alpha_deputy_factor")
FACTOR_PATH = os.path.join(FACTOR_PATH_URL, "alpha_deputy_factor.parquet")

def read_symbols_from_file(filepath=SYMBOLS_FILE):
    with open(filepath, "r") as f:
        symbols = [line.strip().upper().replace(".", "-") for line in f if line.strip()]
    return symbols


def fetch_symbol_data(symbol, from_date, to_date, retries=4, delay=2, rate_delay=0.35):
    url = FMP_DATA_URL.format(symbol=symbol, from_date=from_date, to_date=to_date, apikey=API_KEY)
    for attempt in range(retries):
        try:
            time.sleep(rate_delay)  # 限速
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()

            if data is None or not isinstance(data, list) or len(data) == 0:
                log.warning(f"没有数据 for {symbol} from {from_date} to {to_date}.")
                return None

            df = pd.DataFrame(data)
            df["symbol"] = symbol
            print(f"[DEBUG] Fetched raw data for {symbol}:")
            print(df.head(8))
            return df

        except Exception as e:
            log.warning(f"Error fetching {symbol}: {e}, retrying...")
            time.sleep(delay)

    return None

def load_fmp_bulk_data(symbols, from_date, to_date, output_path=OUTPUT_PATH, big_factor_path=PRICE_TABLE, show_progress=True):
    all_data = []
    for symbol in tqdm(symbols, desc="Fetching symbols", disable=not show_progress):
        symbol = symbol.replace(".", "-")
        request_from_date = from_date
        file_path = os.path.join(output_path, f"{symbol}.parquet")
        existing = None

        if os.path.isfile(file_path):
            existing = pd.read_parquet(file_path)
            existing_dates = existing["date"].unique()
            if existing_dates is not None and not existing.empty and "date" in existing.columns:
                max_date = pd.to_datetime(existing["date"]).max()
                if pd.to_datetime(from_date).normalize() <= max_date.normalize():
                    request_from_date = (max_date + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
                    log.info(f"调整 {symbol} 的起始日期为 {request_from_date}，以避免重复数据。")

        # 如果已经不需要再拉
        if pd.to_datetime(request_from_date) > pd.to_datetime(to_date):
            print(f"[INFO] {symbol} already up to date. 新数据早已入库，不需要操作")
            if existing is not None and not existing.empty:
                all_data.append(existing)
            continue

        ##按照symbol和日期拉取股票
        new_df = fetch_symbol_data(symbol, request_from_date, to_date)
        #查找issues问题，进行checker检验
        issues = check_daily_data(new_df)
        if issues:
            print(f"[WARN] {symbol} has data issues: 存入错误")
            for item in issues:
                print(item["detail"])

        ##如果这一期没有数据，就用旧的数据, 不用合并
        if new_df is None or new_df.empty:
            print(f"[WARN] Skip {symbol}: no valid data returned.这一期没有新数据")
            if existing is not None and not existing.empty:
                all_data.append(existing)
            continue

        #本地旧数据 + 增量 合并
        if existing is not None and not existing.empty:
            df = pd.concat([existing, new_df], ignore_index=True)
            df = df.drop_duplicates(subset=["date"], keep="last")
        else:
            df = new_df

        ##新数据没问题就存入数据
        df.to_parquet(file_path, index=False)
        ##加到大表，为合并做准备
        all_data.append(df)
        print(f"保存 {symbol} 到 {file_path}")


    #2 出循环    ##处理长表price_table.parquet
    full_data = pd.concat(all_data, ignore_index=True).drop_duplicates(subset=["symbol", "date"],keep="last")
    print(f"[INFO] Writing to: price_table {big_factor_path}")
    full_data.to_parquet(big_factor_path, index=False)
    print(f"[DEBUG] Saved file to: {big_factor_path} 保存price_table")

    log.info(f"Data saved to {big_factor_path}, total rows: {len(full_data)}")
    return full_data

def get_alpha_deputy_factor(full_data):
    factor_path = os.path.join(FACTOR_PATH_URL, "alpha_deputy_factor.parquet")
    if os.path.isfile(factor_path):
        alpha_data = pd.read_parquet(factor_path)
    else:
        ##没有alpha_deputy_factor.parquet 就从price_table.parquet 生成一个新的alpha_deputy_factor.parquet
        alpha_data = full_data[["symbol", "date"]]
        alpha_data.set_index(["symbol", "date"], inplace=True)
        alpha_data.to_parquet(FACTOR_PATH, index=True)
    print("取到因子大表")
    return alpha_data

if __name__ == "__main__":
    test_symbols = read_symbols_from_file(SYMBOLS_FILE)
    #test_symbols = ["AAPL", "GOOGL"]
    from_date = "2014-12-31"
    to_date = "2025-12-31"
    df = load_fmp_bulk_data(
        test_symbols,
        from_date,
        to_date,
        output_path=OUTPUT_PATH,
        big_factor_path = PRICE_TABLE,
        show_progress=True
    )

    print(df.head())  # 查看前几行数据