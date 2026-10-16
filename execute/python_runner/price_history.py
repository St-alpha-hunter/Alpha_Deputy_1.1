#!/usr/bin/env python3
"""
[股价走势 2026-10-16] 读取单只股票的日线行情（backtest_data 下的 parquet），按列输出 JSON 给公司页画图用。

由后端 PythonPriceHistoryService 调用（写法和 data_range.py 一样）：
    python price_history.py --symbol AAPL --data-dir <backtest_data 目录>

输出（stdout，一行 JSON，按列组织 —— 比“每天一个对象”小一半多，echarts 也直接要数组）：
    {"symbol": "AAPL", "adjusted": true,
     "dates": ["2020-12-31", ...], "open": [...], "high": [...], "low": [...], "close": [...], "volume": [...]}

退出码：0 成功；2 没有这只股票的数据（后端据此返回 404）；1 其他错误（错误信息写在 stderr）
"""

import argparse
import json
import math
import os
import re
import sys
from pathlib import Path

import pandas as pd
import pyarrow.parquet as parquet


DEFAULT_BACKTEST_DIR = Path(__file__).resolve().parents[2] / "pipeline" / "data" / "backtest_data"

# 只读画图需要的列。parquet 是列式存储，指定 columns 时不会去读十几列因子，读得更快
PRICE_COLUMNS = ["open", "high", "low", "close", "volume"]

# 股票代码只允许大写字母、数字和 "-"（文件名就是这样，如 BRK-B）。
# 后端已经校验过一次，这里再兜一道底：代码会被拼进文件路径，绝不能出现 "../" 之类
SYMBOL_PATTERN = re.compile(r"^[A-Z0-9-]{1,10}$")

EXIT_NOT_FOUND = 2


def _date_column(file: Path) -> str:
    """和 data_range.py 一样：兼容 date / datetime 两种列名，大小写不敏感"""
    names = parquet.ParquetFile(file).schema.names
    lower_names = {name.lower(): name for name in names}
    for candidate in ("date", "datetime"):
        if candidate in lower_names:
            return lower_names[candidate]
    raise ValueError(f"{file.name} 缺少 date/datetime 列")


def _clean(values, digits=None, as_int=False):
    """
    把一列转成 JSON 能用的 Python 列表：NaN / inf → None（JSON 里是 null）。
    不能直接用 json.dumps 处理 NaN：它会输出 NaN 这个词，不是合法 JSON，前端 JSON.parse 会直接报错
    """
    out = []
    for v in values:
        if v is None or (isinstance(v, float) and (math.isnan(v) or math.isinf(v))):
            out.append(None)
        elif as_int:
            out.append(int(v))
        else:
            out.append(round(float(v), digits))
    return out


def read_price_history(symbol: str, data_dir: Path) -> dict:
    file = data_dir / f"{symbol}.parquet"
    if not file.is_file():
        raise FileNotFoundError(f"No local price data for {symbol}")

    date_col = _date_column(file)
    df = pd.read_parquet(file, columns=[date_col] + PRICE_COLUMNS)

    df[date_col] = pd.to_datetime(df[date_col], errors="coerce", utc=True).dt.tz_localize(None)
    # 日期解析失败的行丢掉；按日期升序（画图必须从旧到新），同一天重复的只保留最后一条
    df = (df.dropna(subset=[date_col])
            .sort_values(date_col)
            .drop_duplicates(subset=[date_col], keep="last"))

    return {
        "symbol": symbol,
        # backtest_data 里的开高低收是复权价（pipeline 用 adjOpen/adjHigh/adjLow/adjClose 改名而来），前端会标注
        "adjusted": True,
        "dates": df[date_col].dt.strftime("%Y-%m-%d").tolist(),
        "open": _clean(df["open"], digits=4),
        "high": _clean(df["high"], digits=4),
        "low": _clean(df["low"], digits=4),
        "close": _clean(df["close"], digits=4),
        "volume": _clean(df["volume"], as_int=True),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", required=True)
    parser.add_argument("--data-dir", default=os.getenv("BACKTEST_DATA_DIR", str(DEFAULT_BACKTEST_DIR)))
    args = parser.parse_args()

    symbol = args.symbol.strip().upper().replace(".", "-")
    if not SYMBOL_PATTERN.match(symbol):
        print(f"Invalid symbol: {args.symbol}", file=sys.stderr)
        return 1

    try:
        result = read_price_history(symbol, Path(args.data_dir))
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return EXIT_NOT_FOUND
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1

    # separators 去掉多余空格，体积更小；allow_nan=False：万一还有漏网的 NaN，宁可报错也不输出非法 JSON
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":"), allow_nan=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
