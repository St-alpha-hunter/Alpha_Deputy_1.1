import os
import sys
# from networkx import volume   # [修复合并 2026-10-03] 用不到的误导入（编辑器自动补全加的），没装 networkx 的环境会直接 ImportError
import numpy as np
import pandas as pd

Save_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/alpha_deputy_factor")
Alpha_dir = os.path.join(Save_dir, "alpha_deputy_factor.parquet")

##只有每天加新因子的时候才会算这个去merge合并
##把price_table新算出来的因子列，增加到因子表上
def merge_factors_v1(alpha_deputy_factor, price_table, on=["symbol","date"], how="left"):
    """
    将多个因子DataFrame按照指定的键进行合并，默认使用股票代码和日期作为键，使用左连接方式。
    """
    save_list = ["date","symbol","adjOpen","adjHigh", "adjLow", "adjClose", "volume"]
    assert not alpha_deputy_factor.duplicated(["symbol", "date"]).any()
    assert not price_table.duplicated(["symbol","date"]).any()

    # [修复合并 2026-10-03] 原来的写法：
    #   being_merged = [f for f in price_table.columns if f not in set(save_list) & set(alpha_deputy_factor.columns)]
    #   alpha_deputy_factor_df = pd.merge(alpha_deputy_factor, price_table[being_merged], on=on, how=how)
    # 有三个问题：
    #   1. `not in A & B` 实际是 `not in (A ∩ B)`，把 symbol/date 这两个合并键也排除了 → merge 报 KeyError: 'symbol'
    #   2. 以旧因子大表为基准做 left join：price_table 新拉到的日期/股票全被丢掉，大表永远不会长大
    #   3. 旧大表里已有的 mom_* 列和 price_table 的同名列撞车，会生成 mom_5_x / mom_5_y
    # 现在的写法：以最新、最完整的 price_table 为基准（价格 + 刚算好的所有因子），
    # 再把旧大表里 price_table 没有的“其他因子列”（以后别处算的因子）按 (symbol, date) 并进来
    keys = list(on)
    extra_cols = [c for c in alpha_deputy_factor.columns if c not in set(price_table.columns)]
    alpha_deputy_factor_df = price_table.copy()
    if extra_cols:
        alpha_deputy_factor_df = pd.merge(
            alpha_deputy_factor_df, alpha_deputy_factor[keys + extra_cols], on=keys, how="left")
    alpha_deputy_factor_df = alpha_deputy_factor_df.sort_values(["symbol","date"]).reset_index(drop=True)
    alpha_deputy_factor_df.to_parquet(Alpha_dir, index=False)
    return alpha_deputy_factor_df
##alpha_deputy_factor 有date, symbol, 以及若干factor
##price_table 有symbol,date,adjOpen,adjHigh, adjLow, adjClose, volume



##想想因子大表是每天合并一次，还是等所有因子都算完了再合并一次？每天合并一次的话，数据量会越来越大，可能会比较慢
##V1版本合并存在缺点，每天更新的话，每个symbol都要插入最新一条的数据, 不如干脆每天根据date，和symbol直合并算了，你认为呢？


def merge_factors_v2(alpha_deputy_factor, price_table, on=["symbol","date"], how="left"):
    assert not alpha_deputy_factor.duplicated(["symbol", "date"]).any()
    assert not price_table.duplicated(["symbol", "date"]).any()
    merged_df = pd.merge(alpha_deputy_factor, price_table, on=on, how=how)
    merged_df = merged_df.sort_values(["symbol", "date"]).reset_index(drop=True)
    return merged_df