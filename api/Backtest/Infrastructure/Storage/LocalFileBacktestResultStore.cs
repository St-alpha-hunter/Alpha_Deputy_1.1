using api.Backtest.Interface;

namespace api.Backtest.Infrastructure.Storage
{
    public sealed class LocalFileBacktestResultStore : IBacktestResultStore
    {
        private readonly string _rootDir;

        public LocalFileBacktestResultStore(string rootDir)
        {
            if (string.IsNullOrWhiteSpace(rootDir))
                throw new ArgumentException("rootDir is required.", nameof(rootDir));

            _rootDir = rootDir;
            Directory.CreateDirectory(_rootDir);
        }

        public async Task<string> SaveAsync(
            string taskId,
            string fileName,
            byte[] content,
            string contentType = "application/octet-stream",
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(taskId))
                throw new ArgumentException("taskId is required.", nameof(taskId));
            if (string.IsNullOrWhiteSpace(fileName))
                throw new ArgumentException("fileName is required.", nameof(fileName));

            // 每个任务单独目录：便于清理、追踪
            var taskDir = Path.Combine(_rootDir, taskId);
            Directory.CreateDirectory(taskDir);

            // 防止路径穿越
            var safeName = Path.GetFileName(fileName);

            // 可加时间戳避免覆盖（也可固定 result.json）
            var fullPath = Path.Combine(taskDir, safeName);

            await File.WriteAllBytesAsync(fullPath, content, ct);

            // 返回相对路径更好（迁移机器/容器时更容易）
            var relative = Path.GetRelativePath(_rootDir, fullPath);
            return relative.Replace('\\', '/');
        }

        public async Task<byte[]> ReadAsync(string resultPath, CancellationToken ct = default)
        {
            var fullPath = ResolveFullPath(resultPath);
            return await File.ReadAllBytesAsync(fullPath, ct);
        }

        public Task<bool> ExistsAsync(string resultPath, CancellationToken ct = default)
        {
            var fullPath = ResolveFullPath(resultPath);
            return Task.FromResult(File.Exists(fullPath));
        }

        private string ResolveFullPath(string resultPath)
        {
            if (string.IsNullOrWhiteSpace(resultPath))
                throw new ArgumentException("resultPath is required.", nameof(resultPath));

            // resultPath 是相对 rootDir 的路径
            var safe = resultPath.Replace('/', Path.DirectorySeparatorChar);

            // 防止 .. 穿越
            var combined = Path.GetFullPath(Path.Combine(_rootDir, safe));
            var rootFull = Path.GetFullPath(_rootDir);

            if (!combined.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Invalid resultPath.");

            return combined;
        }
    }
}
