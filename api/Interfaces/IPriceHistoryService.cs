using System.Threading;
using System.Threading.Tasks;

namespace api.Interfaces
{
    // [股价走势 2026-10-16] 单只股票的日线行情，按列组织（每个数组按日期一一对应），前端 echarts 直接用。
    // 返回给前端时会序列化成 camelCase：symbol / adjusted / dates / open / high / low / close / volume
    public sealed record PriceHistory(
        string Symbol,
        bool Adjusted,          // true = 复权价（backtest_data 里存的就是复权后的开高低收）
        string[] Dates,         // "YYYY-MM-DD"，从旧到新
        double?[] Open,
        double?[] High,
        double?[] Low,
        double?[] Close,
        long?[] Volume);

    // [股价走势 2026-10-16] 读取行情的抽象。
    // 现在的实现是 PythonPriceHistoryService（A 方案：调用 Python 脚本读 parquet）；
    // 以后数据量大了换成 B 方案（C# 用 Parquet.Net 直接读），只需要新写一个实现类，
    // 再改 Program.cs 里注册服务的那一行，Controller 和前端都不用动。
    public interface IPriceHistoryService
    {
        /// <param name="symbol">已经规范化过的代码（大写，"." 换成 "-"，如 BRK-B）</param>
        /// <returns>本地没有这只股票的数据时返回 null</returns>
        Task<PriceHistory?> GetDailyAsync(string symbol, CancellationToken ct = default);
    }
}
