using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using api.Backtest.Interface;
using api.Backtest.Domain;
using System.Text.Json;
using api.Contracts;
using System.Text;

using Microsoft.Extensions.DependencyInjection;

namespace api.Backtest.Contracts
{

    

    public sealed class BacktestWorkerOptions
    {
        public int MaxParallelism { get; init; } = 2;              // 先保守，后面调到 10
        public TimeSpan DequeueWait { get; init; } = TimeSpan.FromSeconds(2);
        public int MaxAttempts { get; init; } = 3;
        public TimeSpan BaseRetryDelay { get; init; } = TimeSpan.FromSeconds(2);
    }

    public sealed class BacktestWorker : BackgroundService
    {
        private readonly ILogger<BacktestWorker> _log;
        private readonly IBacktestQueue _queue;
        //声明周期发生冲突：BackgroundService 是 Singleton，而 Repository/Runner 是 Scoped，所以不能直接注入 Repository/Runner
        //解决方法：在 ExecuteAsync 里创建一个 scope 来获取 Repository/Runner
        // private readonly IBacktestRepository _repo;
        // private readonly IBacktestRunner _runner;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IBacktestResultStore _resultStore;
        private readonly BacktestWorkerOptions _opt;

        private readonly SemaphoreSlim _gate;

        public BacktestWorker(
            ILogger<BacktestWorker> log,
            IBacktestQueue queue,
            // IBacktestRepository repo,
            // IBacktestRunner runner,
            IServiceScopeFactory scopeFactory,
            IBacktestResultStore resultStore,
            BacktestWorkerOptions opt)
        {
            _log = log;
            _queue = queue;
            _scopeFactory = scopeFactory;
            // _repo = repo;
            // _runner = runner;
            _resultStore = resultStore;
            _opt = opt;
            _gate = new SemaphoreSlim(_opt.MaxParallelism, _opt.MaxParallelism);
        }

        protected override async Task ExecuteAsync(CancellationToken ct)
        {
            _log.LogInformation("BacktestWorker started. MaxParallelism={MaxParallelism}", _opt.MaxParallelism);

            while (!ct.IsCancellationRequested)
            {
                // Guid? taskId = null;
            Guid taskId = await _queue.DequeueAsync(ct);
                try
                {
                    
                    await _gate.WaitAsync(ct);

                    _ = Task.Run(async () =>
                    {
                        try
                            {
                                await ProcessOneAsync(taskId, ct);
                            }
                            catch (OperationCanceledException) when (ct.IsCancellationRequested)
                            {
                                // 正常停机，不用当 error
                            }
                            catch (Exception ex)
                            {
                                _log.LogError(ex, "Worker ProcessOneAsync crashed. taskId={TaskId}", taskId);
                            }
                            finally
                            {
                                _gate.Release();
                            }
                    });
                }
                catch (OperationCanceledException) when (ct.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _log.LogError(ex, "Worker loop error. taskId={TaskId}", taskId);
                    await Task.Delay(TimeSpan.FromSeconds(1), ct);
                }
            }

            _log.LogInformation("BacktestWorker stopping...");
        }




        private async Task ProcessOneAsync(Guid taskId, CancellationToken ct)
        {

            using var scope = _scopeFactory.CreateScope();

            var repo = scope.ServiceProvider.GetRequiredService<IBacktestRepository>();
            var runner = scope.ServiceProvider.GetRequiredService<IBacktestRunner>();


            // 1) 取任务
            var task = await repo.FindByIdAsync(taskId, ct);
            if (task is null)
            {
                _log.LogWarning("Task not found. taskId={TaskId}", taskId);
                return;
            }

            // 2) Acquire：把 QUEUED → RUNNING（防止重复消费）
            // 这个方法你需要在 repo 实现：只允许在状态为 QUEUED 时更新为 RUNNING，并返回 bool
            var acquired = await repo.TryAcquireAsync(taskId, ct);
            if (!acquired)
            {
                _log.LogInformation("Task not acquired (maybe already running). taskId={TaskId}", taskId);
                return;
            }

            _log.LogInformation("Task acquired. taskId={TaskId}", taskId);

            // 3) 执行 + 重试
            var attempt = 0;
            Exception? lastEx = null;

            while (attempt < _opt.MaxAttempts && !ct.IsCancellationRequested)
            {
                attempt++;
                try
                {
                    await repo.MarkRunningAsync(taskId, startedAt: DateTimeOffset.UtcNow, ct);

                var spec = JsonSerializer.Deserialize<StrategySpecV0>(task.StrategySpecJson)
                        ?? throw new InvalidOperationException("Invalid strategy_spec_json");


                    var runReq = new BacktestRunRequest
                    {
                        TaskId = task.Id,
                        UserId = task.UserId,
                        StrategySpec = spec   // 你可以是 object/json string
                        // Params = task.Params,
                        // DataVersion = task.DataVersion,
                        // EngineVersion = task.EngineVersion,
                    };

                    var runRes = await runner.RunAsync(runReq, ct);

                    if (!runRes.Ok)
                        throw new InvalidOperationException(runRes.ErrorMessage ?? "Runner returned Ok=false");

                    // 4) Store 结果（先 localfile，后面换 S3）
                    // resultStore 你自己实现：WriteAsync(taskId, content/bytes) -> path
                    var finalPath = runRes.ResultPath;

                    if (!string.IsNullOrWhiteSpace(runRes.SummaryJson))
                    {
                        finalPath = await _resultStore.SaveAsync(
                            taskId: taskId.ToString(),
                            fileName:$"_summary.json",
                            content: Encoding.UTF8.GetBytes(runRes.SummaryJson), // 你也可以只存 summaryJson，或者存一个 zip 包
                            //文件和对象存储（本地文件、S3、OSS、MinIO）本质上都是存“字节流”，不是存 string
                            contentType: "application/json",
                            ct: ct);

                    }
                    string? resultJson = null;

                    if (!string.IsNullOrWhiteSpace(runRes.ResultPath) && File.Exists(runRes.ResultPath))
                    {
                        resultJson = await File.ReadAllTextAsync(runRes.ResultPath, ct);
                    }
                    // if (!string.IsNullOrWhiteSpace(runRes.RawResultJson))
                    // {
                    //     finalPath = await _resultStore.SaveAsync(
                    //         taskId: taskId.ToString(),
                    //         fileName: "output.json",
                    //         content: Encoding.UTF8.GetBytes(runRes.RawResultJson),
                    //         contentType: "application/json",
                    //         ct: ct);
                    // }

                    // 5) 更新任务成功
                    await repo.MarkSucceededAsync(
                        taskId: taskId,
                        finishedAt: DateTimeOffset.UtcNow,
                        resultPath: finalPath,
                        resultJson: resultJson,
                        ct: ct);


                    _log.LogInformation("Task succeeded. taskId={TaskId} path={Path}", taskId, finalPath);
                    return;
                }
                catch (Exception ex)
                {
                    lastEx = ex;
                    _log.LogWarning(ex, "Task attempt failed. taskId={TaskId} attempt={Attempt}", taskId, attempt);

                    if (attempt >= _opt.MaxAttempts)
                        break;

                    var delay = JitteredDelay(_opt.BaseRetryDelay, attempt);
                    await Task.Delay(delay, ct);
                }
            }

            // 6) 最终失败：落库 FAILED
            await repo.MarkFailedAsync(
                taskId: taskId,
                finishedAt: DateTimeOffset.UtcNow,
                errorMessage: lastEx?.Message ?? "Unknown error",
                ct: ct);

            _log.LogError(lastEx, "Task failed permanently. taskId={TaskId}", taskId);
        }

        private static TimeSpan JitteredDelay(TimeSpan baseDelay, int attempt)
        {
            // 退避：base * 2^(attempt-1) + 随机抖动
            var exp = Math.Pow(2, Math.Max(0, attempt - 1));
            var ms = baseDelay.TotalMilliseconds * exp;

            var jitter = Random.Shared.Next(0, 250); // 0~250ms 抖动
            return TimeSpan.FromMilliseconds(Math.Min(ms + jitter, 10_000)); // cap 10s
        }
    }
}