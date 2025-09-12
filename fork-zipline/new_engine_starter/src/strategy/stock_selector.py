import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

"""
模块说明：stock_selector.py

职责：
    - 独立负责所有与“选股逻辑”相关的处理
    - 包括：因子打分、行业筛选、行业暴露控制、剔除股票等
    - 输出：一组符合条件的股票 symbol 列表（list[str]）

使用方式：
    - 接收前端传入的参数（因子、权重、行业限制等）
    - 从本地缓存或数据库中读取因子数据
    - 完成过滤、排序、暴露限制等操作
    - 返回前 N 只股票的 symbol，用于后续模板渲染

TODO：
    [ ] 实现：select_stocks(...) 函数
        - 输入：因子权重 dict、过滤条件
        - 输出：list[str] 股票列表
    [ ] 封装行业过滤与暴露限制函数
    [ ] 后续可接入缓存、数据库、FMP 数据源
"""

# sys.path = Python 查找模块的目录列表
# sys.path.append(...) = 临时告诉 Python “也去这个目录找模块”


# ...existing code...

import os
import pandas as pd
from services.compute import compute_many


import importlib.util
import sys
from pathlib import Path


BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 用绝对路径 # 当前文件夹路径: src/strategy
CSV_PATH = os.path.join(BASE_DIR, "symbol_to_industry.csv")


    # 加载行业映射表
symbol_industry_df = pd.read_csv(CSV_PATH)
symbol_to_industry = dict(zip(symbol_industry_df["symbol"], symbol_industry_df["industry"]))


##调用不同是session，动态导入jinja
def load_strategy(session_id: str):
    #strategy_path = Path(f"src/strategy/strategy_{session_id}.py")
    #strategy_path = Path(BASE_DIR) / f"strategy_{session_id}.py"
    strategy_pre_dir = os.path.join(os.path.dirname(BASE_DIR), "strategy_pre")
    strategy_path = Path(strategy_pre_dir) / f"strategy_{session_id}.py"
    spec = importlib.util.spec_from_file_location("strategy_module", strategy_path)
    strategy_module = importlib.util.module_from_spec(spec)
    sys.modules["strategy_module"] = strategy_module
    spec.loader.exec_module(strategy_module)
    return strategy_module

# # 用法
# strategy = load_strategy(session_id)
# number_of_stocks = strategy.number_of_stocks
# selected_industries = strategy.selected_industries
# max_industry_exposure = strategy.max_industry_exposure
# factors = strategy.factors

def filter_by_industry(symbols, selected_industries, symbol_to_industry):
    return [s for s in symbols if symbol_to_industry.get(s) in selected_industries]

def select_stocks(panel, session_id):
    #动态加载策略
    strategy = load_strategy(session_id)
    number_of_stocks = strategy.number_of_stocks
    selected_industries = strategy.selected_industries
    max_industry_exposure = strategy.max_industry_exposure
    factors = strategy.factors
    print("检查存在缺陷的factor,DEBUG factors:", factors)


    if isinstance(factors, list) and isinstance(factors[0], dict):
        factor_keys = [f["code_key"] for f in factors]
        weights = {f["code_key"]: f["weight"] for f in factors}
    elif isinstance(factors, list) and isinstance(factors[0], str):
        factor_keys = factors
        weights = {k: 1 for k in factor_keys}
    else:
        raise ValueError("factors 格式不正确，应为字典列表或字符串列表")
    
    # 先筛选行业
    all_symbols = panel["symbol"].unique()
    filtered_symbols = filter_by_industry(all_symbols, selected_industries, symbol_to_industry)
    panel = panel[panel["symbol"].isin(filtered_symbols)]
    print("selected_industries:", selected_industries)
    print("筛选后 symbol 数量:", len(filtered_symbols))
    print("行业筛选后股票:", filtered_symbols)

    # 计算因子得分
    factor_results = compute_many(panel, factors=factor_keys)
    scores = {}
    for symbol in filtered_symbols:
        total_score = 0
        for key in factor_keys:
            series = factor_results.get(key, {}).get(symbol, pd.Series(dtype="float64"))
            val = series.iloc[-1] if not series.empty else 0
            total_score += weights[key] * (val if pd.notna(val) else 0)
        scores[symbol] = total_score
    selected = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    selected_symbols = [s[0] for s in selected]
    print("symbol_to_industry sample:", list(symbol_to_industry.items())[:5])
    print("panel symbols:", panel["symbol"].unique())
    print("全部选股数量:", len(selected_symbols))

    print("number_of_stocks:", number_of_stocks)
    return selected_symbols[:number_of_stocks]

# def select_stocks(panel):
#     # 直接用这些变量
#     print(number_of_stocks)
#     print(selected_industries)
#     print(factors)
#     # ...选股逻辑...



# def select_stocks(panel: pd.DataFrame, selected_factors, number_of_stocks):
#     factor_keys = [f["name"] for f in selected_factors]
#     weights = {f["name"]: f["weight"] for f in selected_factors}
#     factor_results = compute_many(panel, factor_keys=factor_keys)
#     scores = {}
#     for symbol in panel["symbol"].unique():
#         total_score = 0
#         for key in factor_keys:
#             series = factor_results.get(key, {}).get(symbol, pd.Series(dtype="float64"))
#             val = series.iloc[-1] if not series.empty else 0
#             total_score += weights[key] * (val if pd.notna(val) else 0)
#         scores[symbol] = total_score
#     selected = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:number_of_stocks]
#     return [s[0] for s in selected]
# ...existing code...

if __name__ == "__main__":
    import pandas as pd
    import numpy as np

    # 构造简单测试数据
    test_symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NFLX", "FB", "NVDA", "BABA", "INTC", "CSCO", "ORCL", "IBM", "ADBE", "CMCSA"]
    test_dates = pd.date_range("2024-01-01", periods=5)
    data = {
        "symbol": np.repeat(test_symbols, len(test_dates)),
        "date": list(test_dates) * len(test_symbols),
        "close": np.random.rand(len(test_symbols) * len(test_dates)) * 100,
        "grossProfit": np.random.rand(len(test_symbols) * len(test_dates)) * 10,
        "revenue": np.random.rand(len(test_symbols) * len(test_dates)) * 20,
        "netIncome": np.random.rand(len(test_symbols) * len(test_dates)) * 5,
        "eps": np.random.rand(len(test_symbols) * len(test_dates)),
    }
    panel = pd.DataFrame(data)

    # 这里填你实际生成的 strategy_xxx.py 的 session_id
    session_id = "cfbf1b86-acfa-4cdb-b9a5-3738dbf0da7b"  # 替换为实际 session_id

    result = select_stocks(panel, session_id)
    print(result)
# ...existing code...