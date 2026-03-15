namespace api.Backtest.Dto;
public sealed class BacktestTaskResponse
{
    public string Status { get; set; } = default!;
    public string? ResultUri { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ResultJson { get; set; }
}
