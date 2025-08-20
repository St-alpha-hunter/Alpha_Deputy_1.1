from functools import partial
from zipline.data.bundles.core import register
from zipline.data.bundles.csvdir_new import csvdir_bundle
BIGFILE = r"D:\desktop\practice_dom\FINSHARK\Alpha-Deputy\fork-zipline\all_stocks.parquet"
register("csvdir_new", partial(csvdir_bundle, bigfile=BIGFILE))
print("extension loaded: csvdir_new ->", BIGFILE)