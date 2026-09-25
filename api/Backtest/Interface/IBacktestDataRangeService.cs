namespace api.Backtest.Interface;

public sealed record BacktestDataRange(
    string MinDate,
    string MaxDate,
    string RawMaxDate,
    int FileCount);

public interface IBacktestDataRangeService
{
    Task<BacktestDataRange> GetAsync(CancellationToken ct = default);
}
