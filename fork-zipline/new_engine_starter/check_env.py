import sys
import pkg_resources

print("🐍 当前 Python 解释器路径：")
print(sys.executable)

print("\n📦 已安装的关键依赖：")
for pkg in ["fastapi", "uvicorn", "zipline-reloaded", "pandas", "requests"]:
    try:
        dist = pkg_resources.get_distribution(pkg)
        print(f"{pkg:15} -> {dist.version} @ {dist.location}")
    except pkg_resources.DistributionNotFound:
        print(f"{pkg:15} -> ❌ 未安装")
