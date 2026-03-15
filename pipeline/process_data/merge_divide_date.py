import os
import pandas as pd
from .fetch_data import read_symbols_from_file

Save_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")  
Merge_Path = os.path.join(Save_dir, "raw_divide_symbol")
Divide_Path = os.path.join(Save_dir, "divide_date")

BackTest_dir = os.path.join(Save_dir, "backtest_data")


"""
这个模块暂停使用
"""

def merge_data_by_date(stock_pools, origin_path=Merge_Path):  ##考虑调整顺序
    """
    将多只股票数据按日期对齐合并成宽表
    每行代表一个交易日，每只股票的字段都有独立的列
    """

    all_dfs = []
    for stock_code in stock_pools:
        file_path = os.path.join(origin_path, f"{stock_code}.parquet")
        if os.path.exists(file_path):
            df = pd.read_parquet(file_path)
            df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')
            df.set_index("date", inplace=True)
            all_dfs.append(df)
    wide_data = pd.concat(all_dfs, axis=0)
    wide_data.sort_index(inplace=True)
    ##重设索引，保存为parquet. 不过还没分割完的时候不要撤掉
    ##wide_data = wide_data.reset_index()
    ##不让merged_data 时到落盘，所以注释掉
    ##wide_data.to_parquet(os.path.join(Big_dir, "merged_data.parquet"))

    return wide_data


def divide_data_by_date(wide_data, Divide_dir=Divide_Path):
    """
    按日期将宽表数据拆分成每日数据文件
    每个文件包含所有股票在该交易日的数据，这样方便数据读取和做截面研究
    """
    wide_data.reset_index(inplace=True)
    wide_data.set_index(["date"], inplace=True)
    unique_dates = wide_data.index.unique()
    for date in unique_dates:
        daily_data = wide_data.loc[date]
        # daily_data.reset_index(inplace=True)
        # 确保目录存在
        os.makedirs(Divide_dir, exist_ok=True)
        file_path = os.path.join(Divide_dir, f"{date}.parquet")
        daily_data.to_parquet(file_path)
        print(f"保存每日数据: {file_path}")

def divide_data_by_symbol(df, Backtest_dir=BackTest_dir):
    """
    按股票代码将宽表数据拆分成每只股票的数据文件
    每个文件包含该股票在所有交易日的数据，这样方便计算个股因子
    """
    mapping = {"adjOpen":"open","adjHigh":"high","adjLow":"low","adjClose":"close","Volume":"volume"}
    for symbol, stock_data in df.groupby("symbol"):
        stock_data.reset_index(inplace=True)
        stock_data.columns = stock_data.columns.map(lambda x: mapping.get(x, x))

        stock_data["date"] = pd.to_datetime(stock_data["date"])
        stock_data.sort_values("date", inplace=True)

        os.makedirs(Backtest_dir, exist_ok=True)
        file_path = os.path.join(Backtest_dir, f"{symbol}.parquet")
        stock_data.to_parquet(file_path, index=False)
        print(f"保存股票数据: {file_path}")


if __name__ == "__main__":
    stock_pools = read_symbols_from_file()
    wide_data = merge_data_by_date(stock_pools)
    divide_data_by_date(wide_data)


##升级方向. 
# for date, daily_data in wide_data.groupby(level="date"):

#     file_path = os.path.join(Divide_dir, f"{date}.parquet")

#     daily_data.to_parquet(file_path)
#for 每个分组键, 对应的那一组数据 in 分组结果: