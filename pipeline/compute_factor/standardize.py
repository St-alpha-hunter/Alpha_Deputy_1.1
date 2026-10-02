import numpy as np
import pandas as pd

# [因子标准化 2026-10-03] 整个文件都是这次新加的
#
# 截面标准化：每天、每个因子，在当天所有股票之间做 z-score，让不同因子的数值落在同一个尺度上，
# 这样 strategy 里 “weight × 因子值” 加权相加时，权重才名副其实。
#
#   原始 mom_60 大约 ±30%，mom_5 大约 ±5%，直接相加时 mom_60 几乎决定了得分；
#   标准化后两者都是 “比当天平均水平高/低几个标准差”，量纲一致。
#
# 步骤（每个因子、每一天分别做）：
#   1. 去极值（winsorize）：把当天低于 1% 分位 / 高于 99% 分位的值截到分位数上，
#      防止一只暴涨 300% 的股票把标准差撑大、其他股票的 z-score 全挤到 0 附近
#   2. z-score：(值 - 当天均值) / 当天标准差
#   3. 再把 z-score 截到 ±3：分位数去极值在样本少时几乎不起作用（50 只股票时 99% 分位就是在最大的两个值之间插值），
#      真实数据（约 500 只）z-score 也还能到 5~6，所以最后再兜一道底
#
# 只用同一天的截面数据，不会偷看未来（千万不能对整条时间序列算均值/标准差）。
# 原始因子列保留不动，结果写到新列 “<因子名>_z”，比如 mom_60 → mom_60_z。


def standardize_factors(df, factor_cols, date_col="date",
                        lower_q=0.01, upper_q=0.99, z_clip=3.0, min_count=5, suffix="_z"):
    """
    对 df 里的 factor_cols 做“每日截面去极值 + z-score”，结果写到 <列名><suffix> 新列。

    参数:
        df:          长表，每行是“某只股票某一天”，至少有 date_col 和 factor_cols 这些列
        factor_cols: 要标准化的因子列名，如 ["mom_5", "mom_60"]
        lower_q / upper_q: 去极值用的分位数
        z_clip:      z-score 最后截断到 [-z_clip, z_clip]；传 None 不截
        min_count:   当天有效值少于这个数就不算（样本太少，均值/标准差没意义），结果记为 NaN
        suffix:      新列的后缀

    NaN 的处理：原值是 NaN（比如上市不满 60 天算不出 mom_60）→ 结果也是 NaN，
    并且不参与当天均值/标准差的计算。
    """
    dates = df[date_col]

    for col in factor_cols:
        values = df[col].astype("float64")
        by_date = values.groupby(dates)

        # 1. 去极值：先算出每天的分位数（一天一个值），再按日期 map 回每一行，逐行截断
        lo = dates.map(by_date.quantile(lower_q))
        hi = dates.map(by_date.quantile(upper_q))
        clipped = values.clip(lower=lo, upper=hi)

        # 2. z-score：transform 会把“每天一个的统计量”铺回到当天的每一行，和原表一一对齐
        by_date_clipped = clipped.groupby(dates)
        mean = by_date_clipped.transform("mean")
        std = by_date_clipped.transform("std")
        count = by_date_clipped.transform("count")

        z = (clipped - mean) / std
        # 当天样本太少，或者所有值都一样（std = 0，会除出 inf），都记为 NaN
        z = z.where((count >= min_count) & (std > 0))

        # 3. 最后兜底：z-score 截到 ±z_clip
        if z_clip is not None:
            z = z.clip(lower=-z_clip, upper=z_clip)

        df[col + suffix] = z

    return df
