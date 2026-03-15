import os
import sys
from networkx import volume
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
    being_merged = [f for f in price_table.columns if f not in set(save_list)& set(alpha_deputy_factor.columns)]
    alpha_deputy_factor_df = pd.merge(alpha_deputy_factor, price_table[being_merged], on=on, how=how)
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