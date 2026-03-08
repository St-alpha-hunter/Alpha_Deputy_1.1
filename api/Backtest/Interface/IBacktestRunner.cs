using System;
using System.Threading;
using System.Threading.Tasks;
using api.Contracts;
using api.Backtest.Contracts;


///管理回测任务的部分
namespace api.Backtest.Interface
{
    /// <summary>
    /// 回测执行器抽象：本地进程 / HTTP Python Runner / K8s Job 都可以实现它
    /// </summary>
    public interface IBacktestRunner
    {
        Task<BacktestRunResult> RunAsync(BacktestRunRequest req, CancellationToken ct = default);
    }

    public sealed class BacktestRunRequest
    {
        public Guid TaskId { get; init; }
        public Guid UserId { get; init; }

        // 协议层 JSON 形状（你现在用 object 也行，后面再强类型）
        // public string StrategySpecJson { get; init; } = default!;
        // public string ParamsJson { get; init; } = default!;

        // public string DataVersion { get; init; } = default!;
        // public string EngineVersion { get; init; } = default!;

        public StrategySpecV0 StrategySpec { get; init; } = default!;
    }


    public sealed class BacktestRunResult
    {
        public bool Ok { get; init; }
        public string? ResultPath { get; init; }         // 比如 localfile://... 或 s3://...
        public string? ErrorMessage { get; init; }       // 失败原因
        public string? SummaryJson { get; init; }        // 可选：一段 metrics json（先占位）
    
        public static BacktestRunResult Succeed(string resultPath, string summary)
        => new()
        {
            Ok = true,
            SummaryJson = summary,
            ResultPath = resultPath
        };

        public static BacktestRunResult Failed(string error)
            => new()
            {
                Ok = false,
                ErrorMessage = error
            };
    
    }

}