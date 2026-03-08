public sealed record ValidationError(string Field, string Message);


namespace api.Backtest.Contracts {

public static class StrategySpecValidator
{
    public static List<ValidationError> Validate(StrategySpecV0 spec)
    {
        var errors = new List<ValidationError>();

        // 1) 时间范围
        if (spec.TimeRange.End <= spec.TimeRange.Start)
            errors.Add(new("timeRange", "endDate must be after startDate."));

        // 2) Inputs 权重求和
        // if (spec.Signal.Inputs is null || spec.Signal.Inputs.Count == 0)
        // {
        //     errors.Add(new("signal.inputs", "inputs must not be empty."));
        // }
        // else
       // {
            // factor 唯一性（用 code_key 作为 factor 的话很重要）
        var dup = spec.Signal.Inputs
                .GroupBy(x => x.Factor.Trim())
                .FirstOrDefault(g => g.Count() > 1);

        if (dup != null)
            errors.Add(new("signal.inputs", $"duplicate factor: {dup.Key}"));

        var sum = spec.Signal.Inputs.Sum(x => x.Weight);
        if (Math.Abs(sum - 1.0) > 1e-6)
            errors.Add(new("signal.inputs", $"weights must sum to 1. current sum={sum:0.######}"));
       //}

        // 3) rebalance 周频 dayOfWeek 限制（股票建议 1..5）
        if (spec.Rebalance.Freq == RebalanceFreq.Weekly)
        {
            if (spec.Rebalance.DayOfWeek is < 1 or > 5)
                errors.Add(new("rebalance.dayOfWeek", "weekly rebalance dayOfWeek must be 1..5 (Mon..Fri)."));
        }

        // 4) topk 合法
        if (spec.Portfolio.Selector.K <= 0)
            errors.Add(new("portfolio.selector.k", "topk must be > 0."));

        // 5) 风控一致性（后续添加）
        if (spec.RiskManagement.MaxPositionWeight > 0 && spec.Portfolio.Selector.K > 0)
        {
            // 举例：单票上限不能小于 1/topk 的数量级（可选规则）
            // 这条不是必须，只是演示
        }

        return errors;
    }
}

}