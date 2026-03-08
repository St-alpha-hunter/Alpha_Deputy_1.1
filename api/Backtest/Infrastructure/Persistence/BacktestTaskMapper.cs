using System.Text.Json;
using api.Backtest;
using api.Models;
using api.Backtest.Dto;
using api.Backtest.Domain;

public static class BacktestTaskMapper
{

//创建回测任务--输入这些参数，作用到实例，前者是实例。
    public static BacktestTask ToEntity(CreateBacktestRequest req, Guid userId, string dataVersion, string engineVersion, string idempotencyKey)
    {
        return new BacktestTask
        {//后面的是Dto后的内容
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = BacktestStatus.QUEUED,
            StrategySpecJson = JsonSerializer.Serialize(req.StrategySpec),
            ParamsJson = JsonSerializer.Serialize(req.Params),
            DataVersion = dataVersion,
            EngineVersion = engineVersion,
            IdempotencyKey = idempotencyKey,
            CreatedAt = DateTime.UtcNow
        };
    }

//返回回测结果，返回这些参数
    public static BacktestTaskResponse ToResponse(BacktestTask task)
    {
        return new BacktestTaskResponse
        {
            Status = task.Status.ToString(),
            ResultUri = task.ResultUri,
            ErrorMessage = task.ErrorMessage
        };
    }

//创建回测任务成功，返回这些参数
    public static CreateBacktestResponse ToCreateResponse(BacktestTask task, bool isDuplicate)
    {
        return new CreateBacktestResponse
        {
            TaskId = task.Id,
            Status = task.Status.ToString(),
            ResultUri = task.ResultUri,
            ErrorMessage = task.ErrorMessage,
            IsDuplicate = isDuplicate
        };
    }
}
