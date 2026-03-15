using System.Text.Json.Serialization;
using System.Runtime.Serialization;
using System.ComponentModel.DataAnnotations;

namespace api.Backtest.Contracts;

// 说明：这是“协议层”，不映射数据库，不写逻辑，只定义 JSON 形状

//以下是总体协议
public sealed class StrategySpecV0
{
    [JsonPropertyName("name")]
    [Required]
    public string Name { get; init; } = default!;

    [JsonPropertyName("universe")]
    [Required]
    public string Universe { get; init; } = default!;

    [JsonPropertyName("dataVersion")]
    [Required]
    public string DataVersion { get; init; } = default!;

    [JsonPropertyName("rebalance")]
    [Required]
    public RebalanceSpec Rebalance { get; init; } = default!;

    [JsonPropertyName("signal")]
    [Required]
    public SignalSpec Signal { get; init; } = default!;

    [JsonPropertyName("portfolio")]
    [Required]
    public PortfolioSpec Portfolio { get; init; } = default!;

    [JsonPropertyName("timeRange")]
    [Required]
    public BacktestTimeRange TimeRange { get; init; } = default!;

    [JsonPropertyName("execute")]
    [Required]
    public ExecuteSpec Execute { get; init; } = default!;

    [JsonPropertyName("riskManagement")]
    [Required]
    public RiskMangementSpec RiskManagement { get; init; } = default!;
}




//以下是协议里用到的子结构，调仓协议
public sealed class RebalanceSpec
{
    // v0 只支持固定频率：W（周）/ M（月）…你先用 W
   
    [JsonPropertyName("freq")]
    [Required]
    public RebalanceFreq Freq { get; init; } 

    
    // v0 用 dayOfWeek（1=Mon ... 7=Sun），你现在 example 是 1
    [JsonPropertyName("dayOfWeek")]
    [Range(1,7)]
    public int ? DayOfWeek { get; init; }

        // Monthly 使用：1..31（建议 UI 先限制 1..28）
    [JsonPropertyName("dayOfMonth")]
    [Range(1,28)]
    public int ? DayOfMonth { get; init; }

    // [JsonPropertyName("onHoliday")]
    // public string OnHoliday { get; init; } = "next_trading_day";

    [JsonPropertyName("holidayPolicy")]
    [Required]
    public HolidayPolicy HolidayPolicy { get; init; } = HolidayPolicy.NextTradingDay;
}

//以下是协议里用到的子结构，模型协议
public sealed class SignalSpec
{
    // v0 只支持 linear_weight
    [JsonPropertyName("type")]
    [Required]
    public SignalType Type { get; init; } = SignalType.LinearWeight;

    [JsonPropertyName("inputs")]
    [Required]
    public List<SignalInputSpec> Inputs { get; init; } = new();
    
    [JsonPropertyName("lookback")]
    [Range(1,252)]
    public int Lookback { get; init; } = 20;

    [JsonPropertyName("lag")]
    [Range(0,2)]
    public int Lag { get; init; } = 1;
}

//以下是协议里用到的子结构，模型协议，默认线性投资组合
//好像需要一个列表来处理多因子模型，每个因子一个SignalInputSpec?

/// <summary>
/// </summary>
public sealed class SignalInputSpec
{

    [JsonPropertyName("codeKey")]
    [Required]
    public string CodeKey { get; init; } = default!;

    [JsonPropertyName("factor")]
    public string Factor { get; init; } = default!;

    [JsonPropertyName("weight")]
    [Required]
    public double Weight { get; init; }
}

public sealed class PortfolioSpec
{
    ///没明白这个属性是干啥的
    [JsonPropertyName("selector")]
    [Required]
    public SelectorSpec Selector { get; init; } = default!;

    [JsonPropertyName("weighting")]
    [Required]
    public WeightingSpec Weighting { get; init; } = default!;

    [JsonPropertyName("initialCash")]
    [Range(1000000,100000000)]
    public double InitialCash { get; init; } = 1000000;

    [JsonPropertyName("targetCashWeight")]
    [Range(0,1)]
    public double TargetCashWeight { get; init; } = 0;
}

public sealed class WeightingSpec
{
    // v0 只支持 equal
[JsonPropertyName("type")]
    [Required]
    public WeightingType Type { get; init; } = WeightingType.Equal;
}


public sealed class SelectorSpec
{
    // v0 只支持 topk
  [JsonPropertyName("type")]
    [Required]
    public SelectorType Type { get; init; } = SelectorType.TopK;

    [JsonPropertyName("k")]
    [Range(10, 50)]
    public int K { get; init; }
}

//回测时间与日历设置
public sealed class BacktestTimeRange
{
    
    [JsonPropertyName("startDate")]
    [ Required]
    public DateTimeOffset Start { get; init; }

    [JsonPropertyName("endDate")]
    [Required]
    public DateTimeOffset End { get; init; }

    [JsonPropertyName("calendar")]
    [Required]
    public string Calendar { get; init; } = "XNYS";
}


//执行
public sealed class ExecuteSpec
{
    // [JsonPropertyName("priceType")]
    // public string PriceType { get; init; } = "next_open";
    [JsonPropertyName("priceType")]
    [Required]
    public PriceType PriceType { get; init; } = PriceType.NextOpen;

    [JsonPropertyName("commissionBps")]

    [Required]
    [Range(0, 0.003)]
    public double CommissionBps { get; init; }

    [JsonPropertyName("slippageBps")]
    [Range(0, 0.003)]
    [Required]
    public double SlippageBps { get; init; } 

    [JsonPropertyName("allowShort")]
    [Required]
    public bool AllowShort { get; init; }
}



public sealed class RiskMangementSpec
{
    // max_drawdown
    [JsonPropertyName("maxDrawdown")]
    [Range(0,0.5)]
    public double MaxDrawdown { get; init; }

    // max_position_weight 单票上限
    [JsonPropertyName("maxPositionWeight")]
    [Range(0, 0.4)]
    public double MaxPositionWeight { get; init; }

    //最大换手
    [JsonPropertyName("maxTurnover")]
    [Range(0,10)]
    public double MaxTurnover { get; init; }

    // max_leverage 最大杠杆倍数
    [JsonPropertyName("maxLeverage")]
    [Range(0,5)]
    public double MaxLeverage { get; init; }

    //波动率目标
    [JsonPropertyName("volTarget")]
    [Range(0,1)]
    public double VolTarget { get; init; }
}


public sealed class BenchmarkSpec
{
    [JsonPropertyName("type")]
    public BenchmarkType Type { get; init; } = BenchmarkType.Symbol;

    // 当 type = symbol 时使用
    [JsonPropertyName("symbol")]
    public string? Symbol { get; init; } = "spy";
}

public enum BenchmarkType
{
    [EnumMember(Value = "none")]
    None,

    [EnumMember(Value = "symbol")]
    Symbol
}
public sealed class OutPutspec
{
        //回测输出的结果里要包含哪些内容（比如哪些图表/哪些指标）
        //夏普比率
        //索提诺比率
        //最大回撤
    [JsonPropertyName("metrics")]
    public List<OutputMetric> Metrics { get; init; } = new();
}

public enum OutputMetric
{
    [EnumMember(Value = "equity_curve")]
    EquityCurve,

    [EnumMember(Value = "trade_list")]
    TradeList,

    [EnumMember(Value = "sharpe")]
    Sharpe,

    [EnumMember(Value = "sortino")]
    Sortino,

    [EnumMember(Value = "max_drawdown")]
    MaxDrawdown
}

// D. DateTimeOffset OK，但要规定“日级数据语义”

// 你用 daily bar 时要统一：

// start/end 是否包含当天？

// rebalance 在当天 open 还是 close？

// 建议你把 execution 的 PriceType 说清楚：

// next_open：用信号在 t 日计算，t+1 开盘成交（最安全）

// close：当天收盘成交（最容易未来函数）






//用EnumMember(Value="...") 指定字符串值
public enum SignalType
{
    [EnumMember(Value = "linear_weight")]
    LinearWeight,
}

public enum SelectorType
{
    [EnumMember(Value = "topk")]
    TopK,
}

public enum WeightingType
{
    [EnumMember(Value = "equal")]
    Equal,
}

public enum HolidayPolicy
{
    [EnumMember(Value = "next_trading_day")]
    NextTradingDay,

    [EnumMember(Value = "prev_trading_day")]
    PrevTradingDay,

    [EnumMember(Value = "skip")]
    Skip,
}

public enum PriceType
{
    [EnumMember(Value = "next_open")]
    NextOpen,

    [EnumMember(Value = "close")]
    Close
}

public enum RebalanceFreq
{
    Weekly,
    Monthly
    // [EnumMember(Value = "W")]
    // Weekly,

    // [EnumMember(Value = "M")]
    // Monthly
}