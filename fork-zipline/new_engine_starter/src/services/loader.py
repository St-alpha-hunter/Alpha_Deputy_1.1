import os
import pandas as pd
from tqdm import tqdm
from dotenv import load_dotenv; load_dotenv()
from merge import pit_join_price_funda


MOMENTUM_PATH = os.getenv("Momentum_Data")
INCOME_PATH = os.getenv("Income_Data")

def load_tickers_from_file(filepath: str) -> list:
    with open(filepath, "r", encoding="utf-8") as f:
        tickers = [line.strip() for line in f if line.strip()]
    return tickers

def load_data(tickers, start="2020-08-10", end="2025-08-10") -> pd.DataFrame:
    price_cols = ["date", "symbol","open", "high", "low", "close", "volume"]
    income_cols = [
    "symbol",
    "date",
    "reportedCurrency",
    "cik",
    "filingDate",
    "acceptedDate",
    "fiscalYear",
    "period",
    "revenue",
    "costOfRevenue",
    "grossProfit",
    "researchAndDevelopmentExpenses",
    "generalAndAdministrativeExpenses",
    "sellingAndMarketingExpenses",
    "sellingGeneralAndAdministrativeExpenses",
    "otherExpenses",
    "operatingExpenses",
    "costAndExpenses",
    "netInterestIncome",
    "interestIncome",
    "interestExpense",
    "depreciationAndAmortization",
    "ebitda",
    "ebit",
    "nonOperatingIncomeExcludingInterest",
    "operatingIncome",
    "totalOtherIncomeExpensesNet",
    "incomeBeforeTax",
    "incomeTaxExpense",
    "netIncomeFromContinuingOperations",
    "netIncomeFromDiscontinuedOperations",
    "otherAdjustmentsToNetIncome",
    "netIncome",
    "netIncomeDeductions",
    "bottomLineNetIncome",
    "eps",
    "epsDiluted",
    "weightedAverageShsOut",
    "weightedAverageShsOutDil"
]

    
    prices = pd.read_parquet(MOMENTUM_PATH, columns=price_cols)
    income  = pd.read_parquet(INCOME_PATH,   columns=income_cols)


    # # 先裁剪范围，减小后续 asof 的数据体量
    prices = prices[prices["symbol"].isin(tickers)]
    prices["date"] = pd.to_datetime(prices["date"])
    prices = prices[(prices["date"] >= pd.to_datetime(start)) & (prices["date"] <= pd.to_datetime(end))]

    merged = pit_join_price_funda(prices, income, embargo_bdays=1, max_age_days=1000)
    os.makedirs(r"d:/desktop/practice_dom/FINSHARK/Alpha-Deputy/fork-zipline/new_engine_starter/src/ultimate_data", exist_ok=True)
    try:
        print("开始合并数据...")
        merged.to_parquet(r"d:/desktop/practice_dom/FINSHARK/Alpha-Deputy/fork-zipline/new_engine_starter/src/ultimate_data/merged_ultimate.parquet")
        print("合并完成,保存成功:", os.path.exists(r"d:/desktop/practice_dom/FINSHARK/Alpha-Deputy/fork-zipline/new_engine_starter/src/ultimate_data/merged_ultimate.parquet"))
    except Exception as e:
        print("保存失败:", e)
    return merged


if __name__ == "__main__":
    tickers = load_tickers_from_file(r"d:/desktop/practice_dom/FINSHARK/Alpha-Deputy/symbols_from_asset.txt")
    load_data(tickers)
