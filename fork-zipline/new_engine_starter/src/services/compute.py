import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pandas as pd

from factor.registry import REGISTRY, FACTOR_META



def compute_many(panel: pd.DataFrame, factors=None):
    """
    panel: DataFrame，包含所有需要的字段，必须有 'symbol' 和 'date'
    factors: list[dict]，每个因子参数如 {"name": "mom_3m", ...}
    返回: {factor_key: {symbol: pd.Series}}
    """
    if factors is None:
        factor_keys = list(REGISTRY.keys())
    else:
        factor_keys = list(factors)  # factors 已经是字符串列表

    results = {key: {} for key in factor_keys}
    for symbol, g in panel.groupby("symbol"):
        df = g.set_index("date").sort_index()
        for key in factor_keys:
            try:
                if key in ["gross_margin", "net_margin", "eps"]:
                    results[key][symbol] = REGISTRY[key](df, df["effective_date"])
                # 直接调用注册的因子，无需动态参数
                else:
                    results[key][symbol] = REGISTRY[key](df)
            except Exception as e:
                results[key][symbol] = pd.Series(dtype="float64")  # 或全 NaN
    return results

# • 健壮性：
# o 每个因子内部 _ensure(needs, min_bars, na_policy) 处理缺列/期数不够/简单缺失策略；
# o compute 层可做粗筛（例如某只股票长度明显不够时直接全

if __name__ == "__main__":
    import pandas as pd
    import numpy as np

    # 构造测试数据
    n = 30
    dates = pd.date_range("2024-01-01", periods=n)
    symbols = ["AAPL", "MSFT"]
    data = []
    for symbol in symbols:
        effective_dates = [np.nan]*5 + ["2024-01-01"] + [np.nan]*10 + ["2024-04-01"] + [np.nan]*13
        effective_dates += [np.nan] * (n - len(effective_dates))
        for i in range(n):
            data.append({
                "symbol": symbol,
                "date": dates[i],
                "close": 100 + i + np.random.rand(),
                "grossProfit": 10 + i + np.random.rand(),
                "revenue": 20 + i + np.random.rand(),
                "netIncome": 5 + i + np.random.rand(),
                "eps": 1 + i/10 + np.random.rand(),
                "effective_date": effective_dates[i]
            })
    panel = pd.DataFrame(data)

    results = compute_many(panel)
    for key, symbol_dict in results.items():
        print(f"\n=== {key} ===")
        for symbol, series in symbol_dict.items():
            print(f"{symbol}:")
            print(series)