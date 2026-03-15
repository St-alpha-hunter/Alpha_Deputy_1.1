import os
import requests
from dotenv import load_dotenv
import pandas as pd
##拉取股票的symbol列表，保存到 symbols.txt 文件中，供后续历史数据拉取使用

# 加载 .env 文件中的 API KEY
load_dotenv()
API_KEY = os.getenv("FMP_API_KEY")
if not API_KEY:
    raise ValueError("FMP_API_KEY not set in .env file!")

# FMP symbol 列表 API
# SP500_CONSTITUENT_URL = f"https://financialmodelingprep.com/stable/historical-sp500-constituent?apikey={API_KEY}"
# def fetch_and_save_symbols():
#     print("Fetching symbol list from FMP...")
#     response = requests.get(SP500_CONSTITUENT_URL)
#     #检查 HTTP 响应状态码
#     response.raise_for_status()
#     #解析 JSON 数据
#     data = response.json()

#     print(f"Total symbols fetched: {len(data)}")

#     # 转为DataFrame，筛选主板市场（可按需调整）
#     df = pd.DataFrame(data)
#     # 写入 symbols.txt
#     symbols = df["symbol"].dropna().unique()
#     file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "symbols/symbols_sp500.txt")
#     with open(file_path, "w") as f:
#         for sym in symbols:
#             f.write(f"{sym}\n")

#     print(f"Saved {len(symbols)} symbols to {file_path}")

# if __name__ == "__main__":
#     fetch_and_save_symbols()

url = "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv"

def fetch_and_save_symbols():
    print("Fetching symbol list from CSV...")
    df = pd.read_csv(url)
    symbols = df["Symbol"].tolist()

    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "symbols/symbols_sp500.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        for s in symbols:
            f.write(s + "\n")

    print(f"saved {len(symbols)} symbols")
    print(symbols[:20])

if __name__ == "__main__":
    fetch_and_save_symbols()