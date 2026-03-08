using System.Text.Json.Serialization;

namespace api.Backtest.Domain;

//这里用 string 常量，而不是 enum：因为你将来可能跨服务/跨语言（Python worker）传输，string 最稳。

public sealed class BacktestTaskDto
{
    [JsonPropertyName("taskId")]
    public Guid TaskId { get; init; }

    [JsonPropertyName("status")]
    public string Status { get; init; } = BacktestStatus.CREATED;

    [JsonPropertyName("progress")]
    public int Progress { get; init; } = 0;

    [JsonPropertyName("message")]
    public string? Message { get; init; }

    [JsonPropertyName("specHash")]
    public string SpecHash { get; init; } = default!;

    [JsonPropertyName("dataVersion")]
    public string DataVersion { get; init; } = default!;

    [JsonPropertyName("createdAt")]
    public DateTimeOffset CreatedAt { get; init; }

    [JsonPropertyName("startedAt")]
    public DateTimeOffset? StartedAt { get; init; }

    [JsonPropertyName("finishedAt")]
    public DateTimeOffset? FinishedAt { get; init; }

    [JsonPropertyName("resultUri")]
    public string? ResultUri { get; init; }
}
