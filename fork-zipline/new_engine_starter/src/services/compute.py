



import pandas as pd
from factor.registry import REGISTRY

def compute_many(panel: pd.DataFrame, factors=None):
    """
    panel: DataFrame，包含所有需要的字段，必须有 'symbol' 和 'date'
    factors: list[dict]，每个因子参数如 {"name": "mom_3m", ...}
    返回: {factor_key: {symbol: pd.Series}}
    """
    if factors is None:
        factor_keys = list(REGISTRY.keys())
    else:
        factor_keys = [f["code_key"] for f in factors]

    results = {key: {} for key in factor_keys}
    for symbol, g in panel.groupby("symbol"):
        df = g.set_index("date").sort_index()
        for key in factor_keys:
            try:
                # 直接调用注册的因子，无需动态参数
                results[key][symbol] = REGISTRY[key](df)
            except Exception as e:
                results[key][symbol] = pd.Series(dtype="float64")  # 或全 NaN
    return results

# • 健壮性：
# o 每个因子内部 _ensure(needs, min_bars, na_policy) 处理缺列/期数不够/简单缺失策略；
# o compute 层可做粗筛（例如某只股票长度明显不够时直接全