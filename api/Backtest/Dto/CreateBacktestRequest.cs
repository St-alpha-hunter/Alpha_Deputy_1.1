using api.Backtest.Contracts;


public sealed class CreateBacktestRequest
{
    public StrategySpecV0 StrategySpec { get; set; } = default!;
    public  Dictionary<string, object> Params { get; set; } = new();
}

