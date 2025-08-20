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
# ...existing code...

import os
import pandas as pd
from services.compute import compute_many

import importlib.util
import sys
from pathlib import Path


BASE_DIR = os.path.dirname(__file__)  # 当前文件夹路径: src/strategy
CSV_PATH = os.path.join(BASE_DIR, "symbol_to_industry.csv")


    # 加载行业映射表
symbol_industry_df = pd.read_csv(CSV_PATH)
symbol_to_industry = dict(zip(symbol_industry_df["symbol"], symbol_industry_df["industry"]))


##调用不同是session，动态导入jinja
def load_strategy(session_id):
    strategy_path = Path(f"src/strategy/strategy_{session_id}.py")
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


def select_stocks(panel: pd.DataFrame, session_id):
    #动态加载策略
    strategy = load_strategy(session_id)
    number_of_stocks = strategy.number_of_stocks
    selected_industries = strategy.selected_industries
    max_industry_exposure = strategy.max_industry_exposure
    factors = strategy.factors


    factor_keys = [f["code_key"] for f in factors]
    weights = {f["code_key"]: f["weight"] for f in factors}
    factor_results = compute_many(panel, factor_keys=factor_keys)
    scores = {}
    for symbol in panel["symbol"].unique():
        total_score = 0
        for key in factor_keys:
            series = factor_results.get(key, {}).get(symbol, pd.Series(dtype="float64"))
            val = series.iloc[-1] if not series.empty else 0
            total_score += weights[key] * (val if pd.notna(val) else 0)
        scores[symbol] = total_score
    selected = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    selected_symbols = [s[0] for s in selected]
    filtered_symbols = filter_by_industry(selected_symbols, selected_industries, symbol_to_industry)
    return filtered_symbols[:number_of_stocks]

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