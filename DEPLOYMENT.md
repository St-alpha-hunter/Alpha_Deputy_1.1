# Alpha-Deputy 部署说明

本文档用于将项目部署到 Linux 服务器。当前生产环境使用 Docker Compose，Web 对外提供 HTTP 80 端口，API 和 PostgreSQL 只在 Docker 网络中通信。

## 1. 本次部署信息

服务关系：

- web：Nginx 静态前端，并将 /api/ 转发给 API。
- api：.NET 8，容器内监听 8080；Python runner 使用 BackTrader、Pandas 和 PyArrow。
- db：PostgreSQL 16，使用 Docker named volume 保存业务数据。
- 回测数据：宿主机的 pipeline/data/backtest_data 挂载到 API 容器的 /workspace/pipeline/data/backtest_data。

## 2. 安装服务器依赖

使用具有 sudo 权限的账号执行：

~~~bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git rsync
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
~~~

执行 usermod 后重新登录 SSH，再检查：

~~~bash
docker --version
docker compose version
~~~

云安全组需要放行 TCP 22 和 TCP 80。API 的 8080、PostgreSQL 的 5432 不应直接暴露到公网。

## 3. 同步项目代码

在本地项目根目录执行。

~~~bash
ssh deploy@35.214.92.189 \
  'mkdir -p /home/deploy/Alpha_Deputy_1.1'

rsync -az \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='data.zip' \
  --exclude='data/' \
  --exclude='pipeline/data/' \
  --exclude='*.parquet' \
  --exclude='*.csv' \
  --exclude='node_modules/' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='bin/' \
  --exclude='obj/' \
  ./ deploy@35.214.92.189:/home/deploy/Alpha_Deputy_1.1/
~~~

## 4. 配置环境变量

在服务器创建 /home/deploy/Alpha_Deputy_1.1/.env：

~~~dotenv
ASPNETCORE_ENVIRONMENT=Production

POSTGRES_DB=alpha_deputy
POSTGRES_USER=alpha_deputy
ALPHA_DB_PASSWORD=CHANGE_ME_TO_A_LONG_RANDOM_PASSWORD

JWT_ISSUER=http://35.214.92.189
JWT_AUDIENCE=http://35.214.92.189
JWT_SIGNING_KEY=CHANGE_ME_TO_A_LONG_RANDOM_SECRET

FMP_API_KEY=
VITE_API_BASE=
VITE_ZIPLINE_BASE=/zipline
VITE_API_KEY=

WEB_PORT=80
~~~

设置权限：

~~~bash
cd /home/deploy/Alpha_Deputy_1.1
chmod 600 .env
~~~

VITE_API_BASE 为空时，前端使用同源 /api 路径，由 Nginx 转发到 API。

## 5. 导入回测数据

回测数据必须位于：

~~~text
/home/deploy/Alpha_Deputy_1.1/pipeline/data/backtest_data
~~~

### 从旧服务器复制

~~~bash
ssh pay4att@100.117.210.50 \
  'tar -C Alpha_Deputy_1.1/pipeline/data -czf - backtest_data' \
| ssh deploy@35.214.92.189 \
  'set -eu; mkdir -p /home/deploy/Alpha_Deputy_1.1/pipeline/data; tar --no-same-owner -xzf - -C /home/deploy/Alpha_Deputy_1.1/pipeline/data'
~~~

### 从 data.zip 导入

先查看压缩包内部结构：

~~~bash
python3 -m zipfile -l /path/to/data.zip | sed -n '1,80p'
~~~

传到服务器并解压：

~~~bash
scp /path/to/data.zip deploy@35.214.92.189:/home/deploy/
ssh deploy@35.214.92.189 \
  'python3 -m zipfile -e /home/deploy/data.zip /home/deploy/Alpha_Deputy_1.1/pipeline/data'
~~~

如果压缩包内部已经包含 pipeline/data/backtest_data，应先确认目录层级，避免解压后多出一层目录。

检查 parquet 数量：

~~~bash
ssh deploy@35.214.92.189 \
  'find /home/deploy/Alpha_Deputy_1.1/pipeline/data/backtest_data -maxdepth 1 -type f -name "*.parquet" | wc -l'
~~~

## 6. 构建并启动

~~~bash
cd /home/deploy/Alpha_Deputy_1.1

docker compose -p alpha-deputy \
  --env-file .env \
  -f deploy/docker-compose.prod.yml build api web

docker compose -p alpha-deputy \
  --env-file .env \
  -f deploy/docker-compose.prod.yml up -d db api web
~~~

首次启动时，API 会自动执行 EF Core migration，并通过 FactorSeed 创建缺失的默认因子。PostgreSQL 数据保存在 named volume alpha-deputy_alpha-deputy-postgres。

不要在生产环境执行以下命令，除非已经确认要删除数据库：

~~~bash
docker compose down -v
~~~

## 7. 部署验收

### 容器状态

~~~bash
docker compose -p alpha-deputy \
  --env-file .env \
  -f deploy/docker-compose.prod.yml ps
~~~

预期 db 和 api 为 healthy，web 为 Up，并显示 0.0.0.0:80->80/tcp。

### 健康接口和前端

~~~bash
curl -fsS http://127.0.0.1/healthz
curl -I http://127.0.0.1/

curl -fsS http://35.214.92.189/healthz
curl -I http://35.214.92.189/
~~~

### 因子接口

因子从 PostgreSQL 的 Factors 表读取：

~~~bash
curl -fsS http://35.214.92.189/api/factor
~~~

新库启动后，默认应能看到：

~~~text
5-Day Momentum
10-Day Momentum
20-Day Momentum
60-Day Momentum
120-Day Momentum
252-Day Momentum
~~~

### 回测数据范围

~~~bash
curl -fsS http://35.214.92.189/api/backtests/data-range
~~~

日期上下限由已有 parquet 数据动态计算。

~~~json
{
  "minDate": "2020-12-31",
  "maxDate": "2026-02-28",
  "rawMaxDate": "2026-03-11",
  "fileCount": 503
}
~~~

maxDate 是可用于完整回测的日期上限，rawMaxDate 是文件中实际读到的原始最新日期。

也可以检查 API 容器：

~~~bash
docker exec alpha-deputy-api \
  sh -c 'find /workspace/pipeline/data/backtest_data -maxdepth 1 -type f -name "*.parquet" | wc -l'

docker exec alpha-deputy-api \
  /opt/venv/bin/python /workspace/execute/python_runner/data_range.py \
  --data-dir /workspace/pipeline/data/backtest_data
~~~

## 8. 更新最新代码

只同步代码并重建 API/Web，不删除 PostgreSQL volume，也不覆盖数据目录：

~~~bash
rsync -az \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='data.zip' \
  --exclude='data/' \
  --exclude='pipeline/data/' \
  --exclude='*.parquet' \
  --exclude='*.csv' \
  --exclude='node_modules/' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='bin/' \
  --exclude='obj/' \
  ./ deploy@35.214.92.189:/home/deploy/Alpha_Deputy_1.1/

ssh deploy@35.214.92.189 \
  'cd /home/deploy/Alpha_Deputy_1.1 && \
  docker compose -p alpha-deputy --env-file .env \
  -f deploy/docker-compose.prod.yml build api web && \
  docker compose -p alpha-deputy --env-file .env \
  -f deploy/docker-compose.prod.yml up -d db api web'
~~~

更新后重复第 7 节验收。

## 9. 添加 Git 信息但不推送

通过 rsync 部署的目录可能没有 .git。以下操作只建立远端和本地跟踪分支，不会 push，也不会 checkout 覆盖当前部署文件：

~~~bash
cd /home/deploy/Alpha_Deputy_1.1

if [ ! -d .git ]; then
  git init --initial-branch=main
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin https://github.com/St-alpha-hunter/Alpha_Deputy_1.1.git
else
  git remote add origin https://github.com/St-alpha-hunter/Alpha_Deputy_1.1.git
fi

git fetch origin main
git symbolic-ref HEAD refs/heads/main
git update-ref refs/heads/main refs/remotes/origin/main
git branch --set-upstream-to=origin/main main
git read-tree origin/main

git remote -v
git status --short
~~~

git read-tree 只更新 index。部署代码如果包含尚未推送到 GitHub 的本地修改，git status 出现未提交变更是正常的。

## 10. 常见问题

### 公网访问超时

先确认服务器和容器正在监听 80：

~~~bash
ss -ltnp | grep ':80'
docker port alpha-deputy-web
~~~

如果服务器本机访问正常、外网超时，通常是云安全组或云防火墙未放行 TCP 80。

### 因子页面为空

~~~bash
curl -fsS http://127.0.0.1/api/factor
docker logs --tail 100 alpha-deputy-api
docker exec alpha-deputy-db sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\''SELECT count(*) FROM "Factors";'\'''
~~~

因子接口不要求登录；portfolio、comment 等用户私有接口返回 401 时，应先登录并确认浏览器保存了 JWT。

### 回测报 results[0] 越界

依次确认：

1. API 容器能看到 backtest_data。
2. parquet 文件数量大于 0。
3. 请求日期在 data-range 返回的范围内。
4. 选中的因子存在且 enabled=true。
5. API 日志中没有数据读取或 Python runner 错误。

~~~bash
docker logs --tail 200 alpha-deputy-api
docker exec alpha-deputy-api \
  /opt/venv/bin/python /workspace/execute/python_runner/data_range.py \
  --data-dir /workspace/pipeline/data/backtest_data
~~~

### 报告页出现 currentTaskId 未定义

确认报告 URL 对应的任务仍存在，并从实验中心重新进入报告页。不要直接使用未创建成功任务的 ID 拼接报告 URL。

## 11. 备份

备份 PostgreSQL：

~~~bash
cd /home/deploy/Alpha_Deputy_1.1
mkdir -p backups

docker exec alpha-deputy-db sh -c \
  'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  > "backups/alpha_deputy_$(date +%Y%m%d_%H%M%S).sql"
~~~

备份回测数据：

~~~bash
tar -C /home/deploy/Alpha_Deputy_1.1/pipeline/data \
  -czf /home/deploy/Alpha_Deputy_1.1/backups/backtest_data_$(date +%Y%m%d_%H%M%S).tar.gz \
  backtest_data
~~~

备份文件、.env 和回测数据都可能包含敏感或业务数据，不要提交到 Git 或通过公开链接分发。
