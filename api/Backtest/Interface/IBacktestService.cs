using api.Backtest.Dto;


// “创建回测任务、查询回测任务”的业务用例抽象。

// 它属于 业务层（Application/UseCase） 的入口抽象，Controller 应该依赖它。

namespace api.Backtest.Interface
{
public interface IBacktestService
{
    Task<CreateBacktestResponse> CreateAsync(Guid userId, CreateBacktestRequest req, CancellationToken ct = default);
    Task<BacktestTaskResponse?> GetAsync(Guid userId, Guid taskId, CancellationToken ct = default);
}

}
