using System.ComponentModel.DataAnnotations;
//验证规则 + 基础标记
using System.ComponentModel.DataAnnotations.Schema;
//提供 数据库映射规则
using api.Backtest.Domain;


[Table("backtest_tasks")]
public class BacktestTask
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [Column("status")]
    [MaxLength(32)]
    public string Status { get; set; } = BacktestStatus.QUEUED; // 或 default!

    // jsonb in Postgres (Npgsql)
    [Required]
    [Column("strategy_spec_json", TypeName = "jsonb")]
    public string StrategySpecJson { get; set; } = default!;

    [Required]
    [Column("params_json", TypeName = "jsonb")]
    public string ParamsJson { get; set; } = default!;

    [Required]
    [Column("data_version")]
    [MaxLength(64)]
    public string DataVersion { get; set; } = default!;

    [Required]
    [Column("engine_version")]
    [MaxLength(64)]
    public string EngineVersion { get; set; } = default!;

    [Required]
    [Column("idempotency_key")]
    [MaxLength(128)]
    public string IdempotencyKey { get; set; } = default!;

    [Column("result_uri")]
    [MaxLength(512)]
    public string? ResultUri { get; set; }

    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [Required]
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [Column("started_at")]
    public DateTimeOffset? StartedAt { get; set; }

    [Column("finished_at")]
    public DateTimeOffset? FinishedAt { get; set; }
}
