using Microsoft.EntityFrameworkCore;
using api.Backtest.Interface;
using api.Backtest.Dto;          // 你 DTO 的 namespace（按实际调整）


///Service 操作的对象可能就是 EF Entity
/// 
namespace api.Backtest.Application
{
    public class BacktestService: IBacktestService
    {
        private readonly IBacktestRepository _repo;

        private readonly IBacktestQueue _queue;
        private const int SystemMaxRunning = 10;
        private const int UserMaxRunning = 1;

        private const string DataVersion = "data_v1";
        private const string EngineVersion = "engine_v1";

        // ✅ 构造函数名必须等于类名 BacktestService
        public BacktestService(IBacktestRepository repo, IBacktestQueue queue) {
                _repo = repo;
                _queue = queue;
            }

        public async Task<CreateBacktestResponse> CreateAsync(Guid userId, CreateBacktestRequest req, CancellationToken ct = default)
        {
            // 并发限制
            if (await _repo.CountRunningAsync(ct) >= SystemMaxRunning)
                throw new InvalidOperationException("System at capacity.");

            if (await _repo.CountUserRunningAsync(userId, ct) >= UserMaxRunning)
                throw new InvalidOperationException("You already have a running backtest.");

            // 幂等 key
            var key = Idempotency.ComputeKey(userId, req.StrategySpec, req.Params, DataVersion);

            // 命中已存在任务（任意状态：QUEUED/RUNNING/SUCCEEDED/FAILED） 都视为幂等命中，返回已存在的任务结果（如果有）
            var existed = await _repo.FindByIdempotencyKeyAsync(key, ct);
            if (existed is not null)
                return BacktestTaskMapper.ToCreateResponse(existed, true);

            // 创建 queued
            var entity = BacktestTaskMapper.ToEntity(req, userId, DataVersion, EngineVersion, key);

            await _repo.AddAsync(entity, ct);

            try
            {
                await _repo.SaveChangesAsync(ct);
                // 入队（放在 SaveChangesAsync 后，确保数据库里有记录了）
                await _queue.EnqueueAsync(entity.Id, ct);
            }
            catch (DbUpdateException)
            {
                // 可能唯一键冲突：再查一次（返回已存在的任务）
                var again = await _repo.FindByIdempotencyKeyAsync(key, ct);
                if (again is not null)
                    return BacktestTaskMapper.ToCreateResponse(again, true);

                // 你也可以退而求其次：返回任意同 key 的最新任务
                // 但要 repo 提供一个 FindAnyByKeyAsync，这里先不扩展
                throw;
            }

            return BacktestTaskMapper.ToCreateResponse(entity, false);
        }

        public async Task<BacktestTaskResponse?> GetAsync(Guid userId, Guid taskId, CancellationToken ct = default)
        {
            var task = await _repo.FindByIdAsync(taskId, ct);
            return task is null ? null : BacktestTaskMapper.ToResponse(task);
        }
    }

}