import os
import sys
import numpy as np
import pandas as pd

##这个是定时任务，负责把每天的数据进行排序，计算动量因子，并且合并到大表上

"""
Step1: 利用fetch_data.py/daily_task,每天从FMP拉取原始数据检测落库 到data/divide_symbol                         data/raw_divide_symbol 投喂给回测系统的原材料
Step2: 把数据合并成price_table.parquet，按照date和symbol排序，存储在data/price_table                           归到价格表price_table方便计算因子和后续分割
Step3: 基于 price_table.parquet 计算新因子，生成一个临时 new_factor_df                                         计算动量因子，并且存储在price_table.parquet上
Step4: 将 new_factor_df 按 (date, symbol) 合并进 alpha_deputy_factor.parquet                                 因子大表alpha_deputy_factor
Step5: 计算好因子大表后，按照date分割，存储在data/divide_date上，形成截面数据，方便回测研究使用

ps:主要步骤后记得checker和重新排序，保证数据质量和计算效率
"""
##导入包
from process_data.sort_by_symbol_date import sort_data_by_sybmol_date
from process_data.merge_divide_date import merge_data_by_date, divide_data_by_date
from process_data.update_daily import read_date_from_parquet, get_today_date_str
from process_data.fetch_data import read_symbols_from_file, load_fmp_bulk_data, get_alpha_deputy_factor
from compute_factor.compute_mom import compute_mom
from compute_factor.merge_factor import merge_factors_v1, merge_factors_v2
from process_data.merge_divide_date import divide_data_by_symbol

##导入文件路径
SORT_DIVIDE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data/raw_divide_symbol")     ##按symbol分割的原始价格数据
SORT_PRICE_TABLE = os.path.join((os.path.dirname(os.path.abspath(__file__))), "data/price_table")           ## price_table.parquet，合并后的价格数据，计算因子时的主表
SORT_ALHPA_DEPUTY_FACTOR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data/alpha_deputy_factor")  ## alpha_deputy_factor.parquet，因子大表
SORT_DIVIDE_DATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data/divide_date")       ##按date分割的每日数据, 截面数据，方便研究


if __name__ == "__main__":
    ##Step1 A：重置数据，重新拉取数据
    #symbols = ["AAPL", "GOOGL"] 测试用例
    symbols = read_symbols_from_file()
    startDate = "2020-12-31"
    endDate = get_today_date_str()
    price_df = load_fmp_bulk_data(symbols, startDate, endDate)   ##生成"data/raw_divide_symbol"和"data/price_table"的原始数据，供后续步骤使用
    
    alpha_data = get_alpha_deputy_factor(price_df)

    ##Step2: 计算因子   
    ######计算前排序   ### price_table上计算     ###后续考虑引入滑动窗口，避免重复计算
    sort_data_by_sybmol_date(SORT_PRICE_TABLE, SORT_PRICE_TABLE)
    price_df, mom_factor = compute_mom(price_df, window=5)
    price_df, mom_factor = compute_mom(price_df, window=10)
    price_df, mom_factor = compute_mom(price_df, window=20)
    price_df, mom_factor = compute_mom(price_df, window=60)
    price_df, mom_factor = compute_mom(price_df, window=120)
    price_df, mom_factor = compute_mom(price_df, window=252)
    print("截至{endDate}，因子计算已完成")

    #Step3: 合并因子到大表 alpha_deputy_factor.parquet
    alpha_deputy_factor_df = merge_factors_v1(alpha_data, price_df)
    sort_data_by_sybmol_date(SORT_ALHPA_DEPUTY_FACTOR, SORT_ALHPA_DEPUTY_FACTOR)
    print("已更新因子大表alpha_deputy_factor.parquet")

    #Step4: 按照Symbol分割，形成回测用数据
    divide_data_by_symbol(price_df)
    print("已完成按symbol切分,回测源头数据已经生成")

    ##Step5: 按日期分割，存储在data/divide_date上，形成截面数据，方便回测研究使用
    divide_data_by_date(alpha_deputy_factor_df, SORT_DIVIDE_DATE)
    print("已完成按date切分,回测用的截面数据已经生成")