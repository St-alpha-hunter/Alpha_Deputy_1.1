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

# ----------------------------------------------------------------------
# [加速数据加载 2026-10-07] 整个类都是这次新加的
#
# 问题：backtrader 自带的 PandasData 在 _load() 里，每推进一根 bar、对每一列都调一次
#       self.p.dataname.iloc[行, 列] 取值。591 只股票 × 约 1200 天 × 约 7 列 ≈ 477 万次 pandas 取值，
#       pandas 单次取值开销很大，profile 下来这是整个回测最大的耗时来源。
# 做法：在 start() 里把每一列一次性转成 numpy 数组、日期也提前转好；_load() 只按下标从数组里取。
#       取到的值和赋值顺序都和原版一致（实测 mock 回测的净值曲线、成交、指标逐项完全相同），
#       mock 配置下回测从约 86 秒降到约 52 秒。
#
# backtrader 小知识：
#   - start()：回测开始前调用一次，适合做准备工作（原版在这里把列名换成列下标，存进 self._colmapping）
#   - _load()：引擎每要一根新 bar 就调用一次，把这根 bar 的值写进 self.lines.xxx[0]；
#              返回 True 表示读到了数据，返回 False 表示这只股票的数据读完了
#   - lines 里的日期存的是浮点数（date2num 转换后的结果），不是 datetime 对象
# ----------------------------------------------------------------------
class FastPandasData(bt.feeds.PandasData):

    def start(self):
        super().start()      # 原版的准备工作：self._idx = -1，以及 self._colmapping（每个字段对应第几列）
        df = self.p.dataname
        self._n = len(df)

        # 每个字段：(要写入的 line, 这一列的 numpy 数组)。原版 _load 每次都要重新找列、再用 iloc 取值，这里只做一次
        self._np_cols = []
        for datafield in self.getlinealiases():
            if datafield == "datetime":
                continue
            colindex = self._colmapping[datafield]
            if colindex is None:     # DataFrame 里没有这一列（比如 openinterest），原版也是跳过
                continue
            self._np_cols.append((getattr(self.lines, datafield), df.iloc[:, colindex].to_numpy()))

        # 日期：和原版一样，datetime 参数为 None 时用 DataFrame 的 index，否则用指定的列；提前全部转成 backtrader 的浮点日期
        coldtime = self._colmapping["datetime"]
        tstamps = df.index if coldtime is None else df.iloc[:, coldtime]
        self._np_dt = [bt.date2num(t.to_pydatetime()) for t in tstamps]

    def _load(self):
        self._idx += 1
        if self._idx >= self._n:
            return False             # 这只股票的数据读完了
        i = self._idx
        for line, arr in self._np_cols:
            line[0] = arr[i]         # 原版这里是 line[0] = self.p.dataname.iloc[self._idx, colindex]
        self.lines.datetime[0] = self._np_dt[i]
        return True


###自动类
def create_factorData(config):
    lines, params = wirte_lines_and_params(config)
    return type(
        "FactorData",
        # [加速数据加载 2026-10-07] 原来继承 bt.feeds.PandasData，现在继承上面的 FastPandasData
        (FastPandasData,),
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

        if df.empty:
            print(f"{file.name} 在指定的时间范围内没有数据，已跳过")
            continue

        data = factor_data_cols(dataname=df)
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