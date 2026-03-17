using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Data;
using api.Backtest.Domain;
using api.Backtest.Interface;

//Domain里面是BacktestTask这个聚合根的定义，Interface里面是IBacktestRepository这个接口的定义，这个文件是实现这个接口的具体类，负责和数据库交互，存储和查询BacktestTask实体。
public class BacktestRepository : IBacktestRepository  //为了实现接口IBacktestRepository，你的类名必须是 BacktestRepository
{
    private readonly ApplicationDBContext _db;
    public BacktestRepository(ApplicationDBContext db) => _db = db;
    //以上两行在构造函数中注入了 ApplicationDBContext，确保你的 Startup.cs 或 Program.cs 已正确注册了这个 DbContext
    //统计有几个任务在运行
    public Task<int> CountRunningAsync(CancellationToken ct = default) =>
        _db.BacktestTasks.CountAsync(x => x.Status == BacktestStatus.RUNNING, ct);
    //统计某个用户有几个任务在运行
    public Task<int> CountUserRunningAsync(Guid userId, CancellationToken ct = default) =>
        _db.BacktestTasks.CountAsync(x => x.UserId == userId && x.Status == BacktestStatus.RUNNING, ct);
    //根据任务 ID 和用户 ID 查找任务，确保用户只能访问自己的任务
    public Task<BacktestTask?> FindByIdAsync(Guid taskId, CancellationToken ct = default) =>
        _db.BacktestTasks.FirstOrDefaultAsync(x => x.Id == taskId, ct);
    //根据幂等键查找已成功的任务，确保幂等命中时返回的任务是已成功的
    public Task<BacktestTask?> FindByIdempotencyKeyAsync(string key, CancellationToken ct = default) =>
        _db.BacktestTasks.FirstOrDefaultAsync(x => x.IdempotencyKey == key && x.Status == BacktestStatus.SUCCEEDED, ct);
    //增加一个新的回测任务到数据库

 
        // ========== 你原来的方法略 ==========

        /// <summary>
        /// 原子抢占：只允许 QUEUED -> RUNNING
        /// </summary>
      


    public async Task<bool> TryAcquireAsync(Guid taskId, CancellationToken ct = default)
        {
        //利用数据库的原子更新能力，来实现并发控制
        // EF Core 7+ 推荐用 ExecuteUpdateAsync（不会先查出来再改，直接在 DB 做原子更新）
        var affected = await _db.BacktestTasks
                .Where(x => x.Id == taskId && x.Status == BacktestStatus.QUEUED)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.Status, BacktestStatus.RUNNING)
                    .SetProperty(x => x.StartedAt, DateTimeOffset.UtcNow)
                    , ct);

            return affected == 1;
        }

    public async Task MarkRunningAsync(Guid taskId, DateTimeOffset startedAt, CancellationToken ct = default)
        {
            var affected = await _db.BacktestTasks
                .Where(x => x.Id == taskId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.Status, BacktestStatus.RUNNING)
                    .SetProperty(x => x.StartedAt, startedAt)
                    , ct);

            if (affected == 0)
                throw new InvalidOperationException($"BacktestTask not found: {taskId}");
        }

    public async Task MarkSucceededAsync(Guid taskId, DateTimeOffset finishedAt, string? resultPath, string? resultJson, CancellationToken ct = default)
    {
            var affected = await _db.BacktestTasks
                .Where(x => x.Id == taskId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.Status, BacktestStatus.SUCCEEDED)
                    .SetProperty(x => x.FinishedAt, finishedAt)
                    .SetProperty(x => x.ResultUri, resultPath)
                    .SetProperty(x => x.ResultJson, resultJson)
                    .SetProperty(x => x.ErrorMessage, (string?)null)
                    , ct);

            if (affected == 0)
                throw new InvalidOperationException($"BacktestTask not found: {taskId}");
        }

        public async Task MarkFailedAsync(Guid taskId, DateTimeOffset finishedAt, string errorMessage, CancellationToken ct = default)
        {
            var affected = await _db.BacktestTasks
                .Where(x => x.Id == taskId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.Status, BacktestStatus.FAILED)
                    .SetProperty(x => x.FinishedAt, finishedAt)
                    .SetProperty(x => x.ErrorMessage, errorMessage)
                    , ct);

            if (affected == 0)
                throw new InvalidOperationException($"BacktestTask not found: {taskId}");
        }
    





    public async Task AddAsync(BacktestTask task, CancellationToken ct = default) =>
        await _db.BacktestTasks.AddAsync(task, ct);
    //保存数据库更改
    public Task SaveChangesAsync(CancellationToken ct = default) =>
        _db.SaveChangesAsync(ct);
}
