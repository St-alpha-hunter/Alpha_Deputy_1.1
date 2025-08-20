import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

class MomentumFactor:

    def __init__(self):
        data_momentum = os.getenv("Momentum_Data")
        engine = create_engine(os.getenv("DB_URL"))
        df_momentum = pd.read_parquet(data_momentum)
        asset_df = pd.read_sql_table('asset', engine)
        asset_symbols = set(asset_df['symbol'])

        self.df_momentum = df_momentum
        self.asset_df = asset_df
        self.asset_symbols = asset_symbols


    def compute_momentum(self, days=5, top_n=10, industry=None):
        # 计算动量因子
        self.df_momentum['momentum_{}'.format(days)] = self.df_momentum.groupby('symbol')['close'].pct_change(periods=days)
        filtered_df = self.df_momentum[self.df_momentum['symbol'].isin(self.asset_symbols)]

        # 如果指定行业，只筛选该行业
        if industry:
            filtered_df = filtered_df.merge(self.asset_df[['symbol', 'industry']], on='symbol')
            filtered_df = filtered_df[filtered_df['industry'].isin(industry)]

        # 按动量排序，取前 top_n
        result = filtered_df.sort_values('momentum_{}'.format(days), ascending=False).head(top_n)
        return result['symbol'].tolist()

# 导出类
    __all__ = ["MomentumFactor"]

    class IncomeFactor:

        def __init__(self):
            data_income = os.getenv("Income_Data") #读取收入表
            engine = create_engine(os.getenv("DB_URL"))
            df_income = pd.read_parquet(data_income)
            asset_df = pd.read_sql_table('asset', engine) ##读取资产映射表
            asset_symbols = set(asset_df['symbol']) ##进行映射

            self.df_income = df_income
            self.asset_df = asset_df
            self.asset_symbols = asset_symbols



        def compute_eps(self, top_n=10, industry=None):
            #先判断期数，期数小于5，有缺失或者不足5就自动排除， 再根据复合年增长率 进行百分比打分。
            
            # 1. 过滤期数不足 5 的股票
            valid_symbols = (
                self.df_income.groupby("symbol")["eps"]
                .count()
                .loc[lambda x: x >= 5]  # 至少 5 期
                .index
            )

            self.df_income = self.df_income[self.df_income["symbol"].isin(valid_symbols)]

            def calc_cagr(eps_series):
                eps_start = eps_series.iloc[0]
                eps_end = eps_series.iloc[-1]
                n = len(eps_series) - 1  # 年数或期数 - 1
                if eps_start <= 0:  # 避免除零或负值
                    return None
                return (eps_end / eps_start) ** (1 / n) - 1

            cagr_df = (
                self.df_income.groupby("symbol")["eps"]
                .apply(calc_cagr)
                .dropna()
                .reset_index(name="cagr")
            )            

            # 3. 百分比打分（0~100）
            cagr_df["cagr_score"] = cagr_df["cagr"].rank(pct=True) * 100

            return cagr_df[["symbol", "cagr_score"]].sort_values("cagr_score", ascending=False).head(top_n)


            if self.df_income['eps'].count() < 5:
                return []

            self.df_income['eps'] = self.df_income['eps']
            filtered_df = self.df_income[self.df_income['symbol'].isin(self.asset_symbols)]

            # 如果指定行业，只筛选该行业
            if industry:
                filtered_df = filtered_df.merge(self.asset_df[['symbol', 'industry']], on='symbol')
                filtered_df = filtered_df[filtered_df['industry'].isin(industry)]

            # 按收益排序，取前 top_n
            result = filtered_df.sort_values('income', ascending=False).head(top_n)
            return result['symbol'].tolist()
        
    __all__ = ["IncomeFactor"]