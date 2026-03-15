import os
import backtrader as bt
from reader_json import read_input_json
from datetime import datetime
from pathlib import Path
import pandas as pd

TEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "feed_test.json")

BACKTEST_DIR = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)))), "pipeline/data/backtest_data")

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
    factor_data_cols = create_factorData(config)
    for file in Path(BACKTEST_DIR).glob("*.parquet"):
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
        
        data = factor_data_cols(
            dataname=df)
        datas.append((symbol, data))
        print(f"{file}数据已经准备")
    return datas


## 构造factorData以投喂回测引擎
##用read_input_json读出config(json数据)，
# 取里面的signal里面 input列表里面因子的CodeKey, 按照格式写入到Lines和Params里面

if __name__ == "__main__":
    config = pd.read_json(TEST)
    startDate, endDate = read_date_from_config(config)
    feed_data(config, startDate, endDate)
    print("测验成功！数据已经全部注入回测器")