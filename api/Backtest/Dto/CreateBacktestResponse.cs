using System.Text.Json.Serialization;

using api.Backtest.Domain;
using Newtonsoft.Json;


/// <summary>
/// 创建了回测任务的时候返回什么
/// </summary>
public sealed class CreateBacktestResponse
{
    [JsonPropertyName("taskId")]
    public Guid TaskId { get; init; }

    [JsonPropertyName("status")]
    public required string Status { get; init; }

    [JsonPropertyName("resultUri")]
    public string? ResultUri {get; set;}

    [JsonPropertyName("errorMessage")]
    public string? ErrorMessage { get; set;}

    // 幂等命中时返回 true（可选但很爽）
    [JsonPropertyName("isDuplicate")]
    public bool IsDuplicate { get; init; }
}
