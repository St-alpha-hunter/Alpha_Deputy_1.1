"""
1，先拉取2020年12月31日的原始股票池子
2， 搞2020年12月31日 到 2026年2月28日的 事件List
3, 动态维护映射，data_feed里面维护动态的股票数据
"""

import os
import sys
import numpy as np
import pandas as pd

SAVE_ORIGIN = os.path.join(os.path.dirname(os.path.abspath(__file__)),"data/origin_sp")

URL = "https://raw.githubusercontent.com/hanshof/sp500_constituents/refs/heads/main/sp_500_historical_components.csv"


URL_DY = (
    "https://raw.githubusercontent.com/"
    "lawcal/sp500-components-history/"
    "main/data/components_history.csv"
)

START = pd.Timestamp("2020-12-21")
END = pd.Timestamp("2026-02-28")

def get_origin_sp500(URL, START, output_dir):
    origin_date = START.strftime("%Y-%m-%d")
    df = pd.read_csv(URL)
    origin_date_df =  df[df["date"] <= origin_date].sort_values("date").iloc[-1]
    
    raw_symbol = (
        pd.Series(origin_date_df["tickers"].split(","), name="symbol")
        .str.strip()                 # 去掉可能的空格
        .loc[lambda s: s != ""]      # 去掉空串（末尾多一个逗号时会出现）
        .sort_values()
        .reset_index(drop=True)
    )
    os.makedirs(output_dir, exist_ok=True)   # 文件夹不存在就先建好，已存在不报错
    output_path = os.path.join(output_dir, "origin.parquet")
    raw_symbol.to_frame().to_parquet(output_path, index=False)
    print(f"{origin_date_df['date']} 的初始股票池共 {len(raw_symbol)} 只，已保存到 {output_path}")
    

def dynamic_sp500(URL,START, END, output_dir):
    start = START.strftime("%Y-%m-%d")
    end = END.strftime("%Y-%m-%d")
    dy_df = pd.read_csv(URL)
    # dy_df = dy_df[(dy_df["date"]>=start)&(dy_df["date"]<=end)].copy()
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "dynamic.parquet")
    dy_df.to_parquet(output_path, index=False)
    print("动态数据已存储")
    return dy_df

if __name__ == "__main__":
    origin_df = get_origin_sp500(URL,START,SAVE_ORIGIN)
    dy_df = dynamic_sp500(URL_DY,START,END,SAVE_ORIGIN)
