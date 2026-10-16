using System;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using api.Backtest.Runner;
using api.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace api.Service
{
    /// <summary>
    /// [股价走势 2026-10-16] A 方案：调用 execute/python_runner/price_history.py 读取 parquet。
    /// 调用 Python 的写法照搬 PythonBacktestDataRangeService（读回测数据日期范围的那个服务）。
    ///
    /// 每次启动 Python + 导入 pandas 大约要 1 秒，所以加了一层内存缓存：
    ///   缓存的 key = 股票代码 + parquet 文件的修改时间。
    ///   同一只股票第二次打开直接走缓存；pipeline 重新生成文件后修改时间变了，key 也就变了，自动读新数据。
    /// </summary>
    public sealed class PythonPriceHistoryService : IPriceHistoryService
    {
        private const string Script = "execute/python_runner/price_history.py";
        private const int ExitNotFound = 2;                              // 和 price_history.py 约定：2 = 没有这只股票的数据
        private static readonly TimeSpan Timeout = TimeSpan.FromSeconds(30);

        private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

        private readonly PythonBacktestRunnerOptions _options;
        private readonly IMemoryCache _cache;
        private readonly ILogger<PythonPriceHistoryService> _logger;

        public PythonPriceHistoryService(
            IOptions<PythonBacktestRunnerOptions> options,
            IMemoryCache cache,
            ILogger<PythonPriceHistoryService> logger)
        {
            _options = options.Value;
            _cache = cache;
            _logger = logger;
        }

        public async Task<PriceHistory?> GetDailyAsync(string symbol, CancellationToken ct = default)
        {
            var workingDirectory = ResolveWorkingDirectory();
            var dataDirectory = ResolveDataDirectory(workingDirectory);
            var file = Path.Combine(dataDirectory, $"{symbol}.parquet");

            // 文件不存在 → 本地没有这只股票（搜索页能搜到任何公司，但本地只有股票池里的几百只）
            if (!File.Exists(file))
                return null;

            var cacheKey = $"price-history:{symbol}:{File.GetLastWriteTimeUtc(file).Ticks}";
            if (_cache.TryGetValue(cacheKey, out PriceHistory? cached))
                return cached;

            var result = await RunScriptAsync(symbol, workingDirectory, dataDirectory, ct);
            if (result != null)
            {
                _cache.Set(cacheKey, result, new MemoryCacheEntryOptions
                {
                    // 一直没人看的股票 2 小时后自动清掉，避免缓存无限变大（一只约 70 KB）
                    SlidingExpiration = TimeSpan.FromHours(2),
                });
            }
            return result;
        }

        private async Task<PriceHistory?> RunScriptAsync(
            string symbol, string workingDirectory, string dataDirectory, CancellationToken ct)
        {
            var scriptPath = Path.GetFullPath(Path.Combine(workingDirectory, Script));
            if (!File.Exists(scriptPath))
                throw new FileNotFoundException("Price history script was not found.", scriptPath);

            var psi = new ProcessStartInfo
            {
                FileName = _options.PythonExe,
                WorkingDirectory = workingDirectory,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };
            // ArgumentList 逐个传参数，不经过 shell 拼接，代码里有特殊字符也不会被当成命令执行
            psi.ArgumentList.Add(scriptPath);
            psi.ArgumentList.Add("--symbol");
            psi.ArgumentList.Add(symbol);
            psi.ArgumentList.Add("--data-dir");
            psi.ArgumentList.Add(dataDirectory);

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            timeoutCts.CancelAfter(Timeout);

            using var process = new Process { StartInfo = psi };
            try
            {
                if (!process.Start())
                    throw new InvalidOperationException("Failed to start price history reader.");

                var stdoutTask = process.StandardOutput.ReadToEndAsync(timeoutCts.Token);
                var stderrTask = process.StandardError.ReadToEndAsync(timeoutCts.Token);
                await process.WaitForExitAsync(timeoutCts.Token);
                var stdout = await stdoutTask;
                var stderr = await stderrTask;

                if (process.ExitCode == ExitNotFound)
                    return null;

                if (process.ExitCode != 0)
                {
                    var details = string.IsNullOrWhiteSpace(stderr) ? stdout : stderr;
                    throw new InvalidOperationException(
                        $"Price history reader exited with code {process.ExitCode}: {details.Trim()}");
                }

                var history = JsonSerializer.Deserialize<PriceHistory>(stdout, JsonOptions);
                if (history is null || history.Dates is null || history.Close is null)
                    throw new InvalidOperationException("Price history reader returned invalid JSON.");

                _logger.LogInformation("Loaded price history. Symbol={Symbol}, Days={Days}", symbol, history.Dates.Length);
                return history;
            }
            catch
            {
                try
                {
                    if (!process.HasExited)
                        process.Kill(entireProcessTree: true);
                }
                catch
                {
                    // 清理进程失败时，保留原来的异常
                }
                throw;
            }
        }

        // 下面两个方法和 PythonBacktestDataRangeService 一致：数据目录沿用回测的配置（PythonBacktestRunner:DataDirectory），不新增配置项
        private string ResolveWorkingDirectory()
        {
            if (!string.IsNullOrWhiteSpace(_options.WorkingDirectory))
                return Path.GetFullPath(_options.WorkingDirectory);

            return Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
        }

        private string ResolveDataDirectory(string workingDirectory)
        {
            if (string.IsNullOrWhiteSpace(_options.DataDirectory))
                return Path.Combine(workingDirectory, "pipeline", "data", "backtest_data");

            return Path.IsPathRooted(_options.DataDirectory)
                ? _options.DataDirectory
                : Path.GetFullPath(Path.Combine(workingDirectory, _options.DataDirectory));
        }
    }
}
