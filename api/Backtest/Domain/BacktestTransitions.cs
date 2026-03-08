using api.Backtest.Domain;


public static class BacktestTransitions
{
    public static bool CanTransition(string from, string to) =>
        (from, to) switch
        {
            (BacktestStatus.QUEUED, BacktestStatus.RUNNING) => true,
            (BacktestStatus.RUNNING, BacktestStatus.SUCCEEDED) => true,
            (BacktestStatus.RUNNING, BacktestStatus.FAILED) => true,
            (BacktestStatus.QUEUED, BacktestStatus.CANCELLED) => true,
            (BacktestStatus.RUNNING, BacktestStatus.CANCELLED) => true,
            _ => false
        };
}

