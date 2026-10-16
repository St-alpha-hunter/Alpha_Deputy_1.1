# 线上数据库更新 SOP

适用于 Alpha-Deputy 线上 Postgres 的**结构变更**（加表、加字段、索引、关系）和**数据变更**（批量改值，例如 2026-10-02 的因子 CodeKey 改为 `_z`）。

核心原则：

- **所有改动都走 EF 迁移**，线上不手写临时 SQL。改动记录在 git 里，本地和线上执行的是同一份。
- **已经在线上执行过的迁移，不改也不删。** 要调整就新建一个迁移。
- **先备份，再执行；先生成回滚脚本，再上线。**

---

## 0. 线上环境速查

| 项 | 值 |
|---|---|
| 服务器用户 / 目录 | `sudo -iu deploy`，`~/Alpha_Deputy_1.1` |
| compose 项目名 | `alpha-deputy`（已写进 `docker-compose.prod.yml` 的 `name:`） |
| 容器 | `alpha-deputy-db` / `alpha-deputy-api` / `alpha-deputy-web` |
| **线上数据卷（不能动）** | `alpha-deputy_alpha-deputy-postgres` |
| 数据库 / 用户 | `alpha_deputy` / `alpha_deputy` |
| `.env` 位置 | `<填写实际路径>`（不在 git 里，丢了只能从运行中的容器 `docker inspect` 找回） |
| 备份目录 | `~/alpha-prod-backup` |
| 迁移 SQL 存放 | 仓库 `deploy/sql/` |

下面命令里的 `$DC` 代表：

```bash
DC="docker compose -p alpha-deputy --env-file <.env路径> -f deploy/docker-compose.prod.yml"
```

**禁止操作**：

- `docker compose down -v`：`-v` 会删除数据卷，等于删库。
- `docker volume rm alpha-deputy_alpha-deputy-postgres`。
- 修改 `.env` 里的 `ALPHA_DB_PASSWORD`。Postgres 只在数据卷第一次初始化时读取这个密码，改了不会改变数据库的实际密码，只会让 API 连不上库。
- 修改 `JWT_SIGNING_KEY`。改了所有用户会被强制登出。

---

## 1. 本地：写迁移

```bash
cd api
# 1) 修改 Models/ 或 ApplicationDBContext
# 2) 生成迁移。本地 API 正在运行时 Debug 目录被占用，加 --configuration Release
dotnet ef migrations add <有意义的名字> --configuration Release
```

- **结构变更**：EF 会自动生成 `Up()` / `Down()`，**逐行检查一遍**，确认它理解得对。特别留意重命名：EF 经常把重命名误判成“删列 + 加列”，那样会丢数据，需要手动改成 `RenameColumn`。
- **数据变更**：EF 检测不到数据变化，生成的 `Up()` / `Down()` 是空的。用 `migrationBuilder.Sql(...)` 手写：
  - `Down()` 必须写反向操作；
  - SQL 写成**可以重复执行**的形式，比如 `WHERE NOT EXISTS ...`、只匹配明确的旧值；
  - 留意唯一索引，避免更新后冲突。
- 本地执行并验证：

```bash
dotnet ef database update --configuration Release
dotnet ef migrations list --configuration Release   # 新迁移不应再标 (Pending)
```

功能自测通过后，再进入下一步。

---

## 2. 本地：生成上线 SQL 和回滚 SQL

先确认线上最后执行到哪个迁移（见第 3 步第 1 条），记为 `<线上最后迁移>`。

```bash
cd api
# 上线脚本：从线上最后一个迁移，到这次的新迁移
dotnet ef migrations script <线上最后迁移> <新迁移> --idempotent --configuration Release \
  -o ../deploy/sql/<YYYYMMDD>_<描述>.sql

# 回滚脚本：从新迁移回到线上最后一个迁移（会执行 Down()）
dotnet ef migrations script <新迁移> <线上最后迁移> --configuration Release \
  -o ../deploy/sql/<YYYYMMDD>_<描述>_rollback.sql

# 去掉 EF 生成文件开头的 UTF-8 BOM，否则 psql 可能报语法错误
sed -i '1s/^\xEF\xBB\xBF//' ../deploy/sql/<YYYYMMDD>_<描述>*.sql
```

- `--idempotent`：脚本会先检查 `__EFMigrationsHistory`，已经执行过的迁移会自动跳过，重复执行也安全。
- 打开生成的 SQL **读一遍**，确认整个脚本包在 `START TRANSACTION ... COMMIT` 里，内容也符合预期。
- 迁移文件和两个 SQL 一起提交、推送：`git add api/Migrations deploy/sql && git commit`。

---

## 3. 线上：执行前检查

```bash
sudo -iu deploy && cd ~/Alpha_Deputy_1.1
git pull

# 1) 线上执行到哪个迁移了？最后一行要等于 <线上最后迁移>，否则先停下来排查
docker exec -it alpha-deputy-db psql -U alpha_deputy -d alpha_deputy \
  -c 'SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY 1;'

# 2) 容器是否属于 alpha-deputy 项目、状态是否 healthy
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Label "com.docker.compose.project"}}'

# 3) db 挂的是不是线上数据卷（应该输出 alpha-deputy_alpha-deputy-postgres）
docker inspect alpha-deputy-db --format '{{range .Mounts}}{{.Name}}{{end}}'

# 4) 磁盘空间够不够放备份
df -h ~
```

---

## 4. 线上：备份（每次都做，不能跳过）

```bash
BK=~/alpha-prod-backup/alpha_deputy_$(date +%F_%H%M).dump
docker exec alpha-deputy-db pg_dump -U alpha_deputy -Fc alpha_deputy > "$BK"
ls -lh "$BK"                                   # 大小不能是 0
docker exec -i alpha-deputy-db pg_restore -l < "$BK" | head   # 能列出内容，说明备份文件完好
```

`-Fc` 是自定义格式，压缩率更高，也能用 `pg_restore` 按需恢复。

---

## 5. 线上：按顺序上线

顺序取决于改动类型。原则是：**任何一个时刻，正在运行的代码和当时的数据库都能配合工作。**

| 改动类型 | 顺序 |
|---|---|
| **新增**表、字段、索引（旧代码不受影响） | 先执行 SQL → 再部署代码 |
| **删除或重命名**字段、表 | 拆成两次上线：① 先部署“不再使用它”的代码；② 下次上线再执行删除的 SQL |
| **数据变更依赖新数据或新代码**（例如 CodeKey 改为 `_z`，依赖 pipeline 生成 `_z` 列） | 先部署代码 → 跑 pipeline 生成数据 → 最后执行 SQL |

部署代码：

```bash
$DC up -d --build
```

执行迁移 SQL（`ON_ERROR_STOP=1`：遇到错误立即停止，整个事务回滚，不会只执行一半）：

```bash
docker exec -i alpha-deputy-db psql -v ON_ERROR_STOP=1 -U alpha_deputy -d alpha_deputy \
  < deploy/sql/<YYYYMMDD>_<描述>.sql
```

正常的输出以 `COMMIT` 结尾。如果看到 `ERROR` 或 `ROLLBACK`，说明数据库没有被修改，查明原因后再重新执行。

---

## 6. 线上：验证

```bash
# 1) 迁移记录里有了新迁移
docker exec -it alpha-deputy-db psql -U alpha_deputy -d alpha_deputy \
  -c 'SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY 1 DESC LIMIT 3;'

# 2) 数据或结构符合预期（按本次改动写查询，例如）
docker exec -it alpha-deputy-db psql -U alpha_deputy -d alpha_deputy \
  -c 'SELECT "Id","Name","CodeKey" FROM "Factors" ORDER BY "Id";'

# 3) API 健康
docker ps --format 'table {{.Names}}\t{{.Status}}'
docker logs --tail 50 alpha-deputy-api
```

4) 在网页上实际操作一遍受影响的功能，例如提交一次回测，确认能跑出报告。

---

## 7. 回滚

**方案 A：执行回滚脚本（首选，只撤销本次迁移）**

```bash
docker exec -i alpha-deputy-db psql -v ON_ERROR_STOP=1 -U alpha_deputy -d alpha_deputy \
  < deploy/sql/<YYYYMMDD>_<描述>_rollback.sql
```

如果代码也要退回：`git checkout <上一个版本>` 后执行 `$DC up -d --build`。

**方案 B：从备份恢复整个库（最后手段：备份之后产生的所有数据都会丢失）**

```bash
$DC stop api                                   # 先停 API，避免恢复过程中有写入
docker exec -i alpha-deputy-db pg_restore -U alpha_deputy -d alpha_deputy \
  --clean --if-exists < ~/alpha-prod-backup/<备份文件>.dump
$DC start api
```

---

## 8. 检查清单

- [ ] 本地迁移已生成，并检查过 `Up()` / `Down()`
- [ ] 本地 `database update` 成功，功能自测通过
- [ ] 生成了上线 SQL 和回滚 SQL，去掉了 BOM，读过内容
- [ ] 迁移文件和 SQL 已提交、推送
- [ ] 线上 `__EFMigrationsHistory` 最后一条和预期一致
- [ ] db 容器挂的是 `alpha-deputy_alpha-deputy-postgres`
- [ ] 已备份，备份文件大小正常，`pg_restore -l` 能读出内容
- [ ] 按改动类型选对了上线顺序
- [ ] SQL 输出以 `COMMIT` 结尾
- [ ] 第 6 步的验证全部通过，网页功能正常

---

## 附：变更记录

| 日期 | 迁移 | 内容 | 备注 |
|---|---|---|---|
| 2026-10-02 | `20261002032527_FactorCodeKeyToZScore` | 6 个动量因子的 CodeKey 改为 `mom_N_z` | 依赖 pipeline 生成 `_z` 列，按“先代码 → pipeline → SQL”的顺序上线 |
