using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <summary>
    /// [因子标准化 2026-10-03] 纯数据迁移（表结构不变）：
    /// 把动量因子的 CodeKey 从原始因子 mom_N 改成截面标准化后的 mom_N_z，
    /// 回测时策略就会读 pipeline 新生成的 _z 列。
    ///
    /// 上线顺序：先部署代码 → 在服务器上重跑 pipeline（生成 _z 列）→ 最后执行这个迁移。
    /// 反过来的话，回测会因为数据里找不到 mom_N_z 列而失败。
    /// </summary>
    public partial class FactorCodeKeyToZScore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 只改 pipeline 真正算了的 6 个窗口（5/10/20/60/120/252），别的 CodeKey 不动；
            // CodeKey 有唯一索引，如果已经存在同名的 mom_N_z 因子就跳过这一行，避免违反唯一约束
            migrationBuilder.Sql("""
                UPDATE "Factors" AS f
                SET "CodeKey" = f."CodeKey" || '_z',
                    "UpdatedAt" = NOW()
                WHERE f."CodeKey" ~ '^mom_(5|10|20|60|120|252)$'
                  AND NOT EXISTS (
                      SELECT 1 FROM "Factors" AS g WHERE g."CodeKey" = f."CodeKey" || '_z'
                  );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 回滚：mom_N_z → mom_N（同样避开唯一约束冲突）
            migrationBuilder.Sql("""
                UPDATE "Factors" AS f
                SET "CodeKey" = regexp_replace(f."CodeKey", '_z$', ''),
                    "UpdatedAt" = NOW()
                WHERE f."CodeKey" ~ '^mom_(5|10|20|60|120|252)_z$'
                  AND NOT EXISTS (
                      SELECT 1 FROM "Factors" AS g WHERE g."CodeKey" = regexp_replace(f."CodeKey", '_z$', '')
                  );
                """);
        }
    }
}
