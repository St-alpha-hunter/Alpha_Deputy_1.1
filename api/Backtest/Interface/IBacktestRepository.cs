using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Backtest.Domain;
using api.Helpers;
using api.Backtest.Interface;
///任何实现这个接口的类，必须提供这下这些个方法，签名必须一模一样
///怎么访问/保存/操作  backtest_tasks 这张表”的抽象,


namespace api.Backtest.Interface
{
    public interface IBacktestRepository
    {
    Task<int> CountRunningAsync(CancellationToken ct = default);
    Task<int> CountUserRunningAsync(Guid userId, CancellationToken ct = default);

    Task<BacktestTask?> FindByIdAsync(Guid taskId, CancellationToken ct = default);
    Task<BacktestTask?> FindByIdempotencyKeyAsync(string key, CancellationToken ct = default);

    /// <summary>只允许 QUEUED → RUNNING，成功返回 true</summary>
    Task<bool> TryAcquireAsync(Guid taskId, CancellationToken ct = default);

    Task MarkRunningAsync(Guid taskId, DateTimeOffset startedAt, CancellationToken ct = default);

        Task MarkSucceededAsync(Guid taskId, DateTimeOffset finishedAt, string? resultPath, string? resultJson, CancellationToken ct = default);

        Task MarkFailedAsync(Guid taskId, DateTimeOffset finishedAt, string errorMessage, CancellationToken ct = default);
    
    Task AddAsync(BacktestTask task, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    }
}