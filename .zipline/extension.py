from functools import partial
from zipline.data.bundles.core import register
from zipline.data.bundles.csvdir import csvdir_equities


# 正确用法应该是
register(
    "csvdir",
    csvdir_equities(
        ["daily"],
        r"D:\desktop\practice_dom\FINSHARK\Alpha-Deputy\fork-zipline\data\bundles\data\backtest"  
    )
)
