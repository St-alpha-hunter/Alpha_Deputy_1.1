using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using api.Backtest.Interface;
using api.Backtest.Contracts;

namespace api.Backtest.Runner
{
    /// <summary>
    /// 临时：假执行器，用来把 Create → Enqueue → Worker → Update 跑通
    /// </summary>
    public sealed class FakeBacktestRunner : IBacktestRunner
    {
        public async Task<BacktestRunResult> RunAsync(BacktestRunRequest req, CancellationToken ct = default)
        {
            await Task.Delay(TimeSpan.FromSeconds(2), ct);

            var summary = JsonSerializer.Serialize(new
            {
                taskId = req.TaskId,
                ok = true,
                cagr = 0.12,
                sharpe = 1.1
            });

            return new BacktestRunResult
            {
                Ok = true,
                ResultPath = $"localfile://backtest-results/{req.TaskId}.json",
                SummaryJson = summary
            };
        }
    }
}