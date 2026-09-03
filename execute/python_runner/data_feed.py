import os
import backtrader as bt
from reader_json import read_input_json
from datetime import datetime
from pathlib import Path
import pandas as pd

TEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "feed_test.json")

BACKTEST_DIR = os.getenv(
    "BACKTEST_DATA_DIR",
    os.path.join(
        os.path.dirname(
            os.path.dirname(
                os.path.dirname(
                    os.path.abspath(__file__)))), "pipeline/data/backtest_data"),
)

BASE_PARAMS = (
        ("datetime", None),
        ("open", "open"),
        ("high", "high"),
        ("low", "low"),
        ("close", "close"),
        ("volume", "volume"),
        ("openinterest", None)
    )

##日期校验
def parse_date(date_str):
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.replace(tzinfo=None)
    except Exception:
        raise ValueError(f"Invalid date format: {date_str}")

##读取日期
def read_date_from_config(config):
    #####测试的时候注意去修改
    #config = read_input_json("input.json")
    config_time_range = config["timeRange"]
    startDate = parse_date(config_time_range["startDate"])
    endDate = parse_date(config_time_range["endDate"])
    if startDate >= endDate:
        raise ValueError(
            f"Backtest startDate must be earlier than endDate: {startDate} >= {endDate}"
        )
    return startDate, endDate


##写一个函数读取codeKey
def get_factor_keys(config):
     codeKeys = [x["codeKey"] for x in config["signal"]["inputs"]]
     return codeKeys
##创造lines
def build_lines(codeKeys):
    lines = tuple(codeKeys)
    return lines
##写Params
def build_factor_params(factors):
    return tuple((f, f) for f in factors)
##合并到默认的params
def build_params(factors):
    factor_params = build_factor_params(factors)
    params = BASE_PARAMS + factor_params
    return params


###整合
def wirte_lines_and_params(config):
    codeKeys = get_factor_keys(config)
    lines = build_lines(codeKeys)
    params = build_params(codeKeys)
    return lines, params

###自动类
def create_factorData(config):
    lines, params = wirte_lines_and_params(config)
    return type(
        "FactorData",
        (bt.feeds.PandasData,),
        {
            "lines": lines,
            "params": params,
        }
    )


###投喂数据
def feed_data(config, startDate, endDate):
    datas = []
    factor_keys = get_factor_keys(config)
    if not factor_keys:
        raise ValueError("No factors selected. Add at least one factor before running a backtest.")

    files = sorted(Path(BACKTEST_DIR).glob("*.parquet"))
    if not files:
        raise ValueError(
            f"No backtest parquet data found in {BACKTEST_DIR}. "
            "Generate or mount market data before running BackTrader."
        )

    factor_data_cols = create_factorData(config)
    for file in files:
        symbol = file.stem
        df = pd.read_parquet(file)
         # 统一列名，小写更稳.加一道检查
        df.columns = [c.lower() for c in df.columns]

        # 专门去处理date, 把 date 转成 datetime，并改名为 datetime，确保稳健性
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"]).dt.tz_localize(None)
            df = df.sort_values("date")
            df = df[(df["date"] >= startDate) & (df["date"] <= endDate)]
            df = df.rename(columns={"date": "datetime"})
            df = df.set_index("datetime")
        elif "datetime" in df.columns:
            df["datetime"] = pd.to_datetime(df["datetime"]).dt.tz_localize(None)
            df = df.sort_values("datetime")
            df = df[(df["datetime"] >= startDate) & (df["datetime"] <= endDate)]
            df = df.set_index("datetime")
        else:
            raise ValueError(f"{file.name} 缺少 date/datetime 列")

        if df.empty:
            print(f"跳过 {file.name}: 所选日期范围内没有数据")
            continue

        required_columns = {"open", "high", "low", "close", "volume", *factor_keys}
        missing_columns = sorted(required_columns.difference(df.columns))
        if missing_columns:
            raise ValueError(
                f"{file.name} is missing required columns: {', '.join(missing_columns)}"
            )
        
        data = factor_data_cols(
            dataname=df)
        datas.append((symbol, data))
        print(f"{file}数据已经准备")

    if not datas:
        raise ValueError(
            f"No market data rows are available between {startDate.date()} and "
            f"{endDate.date()} in {BACKTEST_DIR}."
        )
    return datas


## 构造factorData以投喂回测引擎
##用read_input_json读出config(json数据)，
# 取里面的signal里面 input列表里面因子的CodeKey, 按照格式写入到Lines和Params里面

if __name__ == "__main__":
    config = pd.read_json(TEST)
    startDate, endDate = read_date_from_config(config)
    feed_data(config, startDate, endDate)
    print("测验成功！数据已经全部注入回测器")
