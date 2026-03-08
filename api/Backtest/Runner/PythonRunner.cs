using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using api.Backtest.Interface;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.Text;
using System.IO;
using Microsoft.AspNetCore.Http.HttpResults;

namespace api.Backtest.Runner
{
    public sealed class PythonBacktestRunnerOptions
    {
        public string PythonExe { get; set; } = "python";
        public string ScriptPath { get; set; } = "python_runner/runner.py";
        //Python 脚本的路径。这个路径可以是绝对路径，也可以是相对于 WorkingDirectory 的路径。比如如果 WorkingDirectory 是 /app，那么 ScriptPath 是 python_runner/runner.py 就表示 /app/python_runner/runner.py
        public string WorkingDirectory { get; set; } = AppContext.BaseDirectory;
        public int TimeoutSeconds { get; set; } = 100000;
    }

    public sealed class PythonRunnerOutput
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        //仔细看看BackTrader要求什么返回类型
        public Dictionary<string, object>? Metrics { get; set; }
        public object? EquityCurve { get; set; }
        public object? TradeList { get; set; }
        public string? RawJson { get; set; }
    }

    public sealed class PythonBacktestRunner : IBacktestRunner
    {
        private readonly PythonBacktestRunnerOptions _options;
        private readonly ILogger<PythonBacktestRunner> _logger;

        public PythonBacktestRunner(
            ILogger<PythonBacktestRunner> logger,
            IOptions<PythonBacktestRunnerOptions> options)
        {
            _logger = logger;
            _options = options.Value;
        }

        public async Task<BacktestRunResult> RunAsync(
            BacktestRunRequest req,
            CancellationToken ct = default)
        {
            if (req is null) throw new ArgumentNullException(nameof(req));
            if (req.StrategySpec is null)
                throw new InvalidOperationException("StrategySpec is null.");
            //拼接出工作目录

            _logger.LogInformation(
                "实际工作目录是 WorkingDirectory={WorkingDirectory}, BaseDirectory={BaseDirectory}",
                _options.WorkingDirectory, AppContext.BaseDirectory);
/// 实际工作目录是 WorkingDirectory=D:\desktop\Files(2024-2025)\practice_dom\FINSHARK\Alpha-Deputy\api\bin\Debug\net8.0\, 
/// BaseDirectory=D:\desktop\Files(2024-2025)\practice_dom\FINSHARK\Alpha-Deputy\api\bin\Debug\net8.0
            var runRoot = Path.Combine(
                _options.WorkingDirectory,
                "backtest_runs",
                req.TaskId.ToString());
            //创建目录
            //如果目录已存在，也不会报错。
            Directory.CreateDirectory(runRoot);

            var inputPath = Path.Combine(runRoot, "input.json");
            var outputPath = Path.Combine(runRoot, "output.json");
            var stderrPath = Path.Combine(runRoot, "stderr.log");
            var stdoutPath = Path.Combine(runRoot, "stdout.log");

            // input.json：传给 Python 的输入
            // output.json：Python 生成的输出
            // stderr.log：Python 标准错误日志
            // stdout.log：Python 标准输出日志


            //把策略写入 input.json
            await File.WriteAllTextAsync(inputPath, JsonSerializer.Serialize(req.StrategySpec), Encoding.UTF8, ct);

            //构造启动Python函数
            var psi = new ProcessStartInfo
            {
                FileName = _options.PythonExe,
                //指定进程工作目录,而不是脚本工作目录
                WorkingDirectory = _options.WorkingDirectory,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                RedirectStandardInput = false,
                //必须设为 false 才能重定向输出流,也是现代 .NET 启动外部进程的常见配置
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            // runner.py --input xxx --output yyy --task-id zzz

            var scriptFullPath = Path.GetFullPath(
                Path.Combine(_options.WorkingDirectory, _options.ScriptPath));

            _logger.LogInformation(
                "执行器路径 Python script resolved: {ScriptFullPath}, Exists={Exists}",
                scriptFullPath,
                File.Exists(scriptFullPath));


            //  添加命令行参数
            //psi.ArgumentList.Add(_options.ScriptPath); 把python_runner抽象了出来，所以改个位置
            
            
            psi.ArgumentList.Add(scriptFullPath);
            psi.ArgumentList.Add("--input");
            psi.ArgumentList.Add(inputPath);
            psi.ArgumentList.Add("--output");
            psi.ArgumentList.Add(outputPath);
            psi.ArgumentList.Add("--task-id");
            psi.ArgumentList.Add(req.TaskId.ToString());

            _logger.LogInformation(
                "开始调用BackTrader回测引擎,Starting Python runner. TaskId={TaskId}, PythonExe={PythonExe}, ScriptPath={ScriptPath}",
                req.TaskId, _options.PythonExe, _options.ScriptPath);

            //创建进程对象
            using var process = new Process { StartInfo = psi, EnableRaisingEvents = true };
            //准备接收stdout和stderr
            var stdout = new StringBuilder();
            var stderr = new StringBuilder();

            //订阅标准输出事件
            process.OutputDataReceived += (_, e) =>
            {
                if (!string.IsNullOrWhiteSpace(e.Data))
                    stdout.AppendLine(e.Data);
            };

            //订阅标准错误事件
            process.ErrorDataReceived += (_, e) =>
            {
                if (!string.IsNullOrWhiteSpace(e.Data))
                    stderr.AppendLine(e.Data);
            };
            //try 块：真正执行 Python
            try
            {
                if (!process.Start())
                    throw new InvalidOperationException("加载失败 Failed to start python process.");
                //开始异步读取输出流
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                //构造带超时的取消令牌
                using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                timeoutCts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

                //等待Python进程退出
                //WaitForExitAsync 等待进程退出，但有时异步输出事件的最后几行可能还没完全刷新进 StringBuilder。
                //更稳的写法通常会在退出后再补一个同步等待，或者确保流完全关闭。
                await process.WaitForExitAsync(timeoutCts.Token);

                await File.WriteAllTextAsync(stdoutPath, stdout.ToString(), Encoding.UTF8, CancellationToken.None);
                await File.WriteAllTextAsync(stderrPath, stderr.ToString(), Encoding.UTF8, CancellationToken.None);

                //检查进程退出码
                if (process.ExitCode != 0)
                {
                    var err = stderr.ToString();
                    _logger.LogError(
                        "Python runner failed. TaskId={TaskId}, ExitCode={ExitCode}, Stderr={Stderr}",
                        req.TaskId, process.ExitCode, err);

                    return BacktestRunResult.Failed(
                        $"Python runner exited with code {process.ExitCode}. {err}");
                }

                //检查 output.json 是否存在

                if (!File.Exists(outputPath))
                {
                    _logger.LogError(
                        "Python runner completed but output.json not found. TaskId={TaskId}, OutputPath={OutputPath}",
                        req.TaskId, outputPath);

                    return BacktestRunResult.Failed(
                        $"Python runner completed but output file was not created: {outputPath}");
                }

                //读取并解析 output.json
                var outputJson = await File.ReadAllTextAsync(outputPath, ct);

                var parsed = JsonSerializer.Deserialize<PythonRunnerOutput>(
                    outputJson,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });


                //如果反序列化后为空，说明：Json为空，格式不合法，无法映射成对象
                if (parsed is null)
                {
                    return BacktestRunResult.Failed("Python runner returned empty or invalid JSON.");
                }
                //检查 Python 自报成功与否,看看业务逻辑是否成立
                if (!parsed.Success)
                {
                    return BacktestRunResult.Failed(
                        error: parsed.Message ?? "业务逻辑 Python runner reported failure without message.");
                }

                return BacktestRunResult.Succeed(
                    resultPath: outputPath,
                    summary: parsed.Message ?? "Backtest finished successfully.");
            }
            //超时处理
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)   //捕获取消异常，但排除外部取消的情况（比如用户取消了请求）
            {
                try
                {
                    //尝试杀掉进程
                    if (!process.HasExited)
                        process.Kill(entireProcessTree: true);
                }
                catch
                {
                    // ignore kill failure
                }
                    //记录超时日志
                _logger.LogError(
                    "Python runner timed out. TaskId={TaskId}, TimeoutSeconds={TimeoutSeconds}",
                    req.TaskId, _options.TimeoutSeconds);

                //返回失败结果
                return BacktestRunResult.Failed(
                    $"Python runner timed out after {_options.TimeoutSeconds} seconds.");
            }
            catch (Exception ex)
            //通用异常处理  目前就当作是用户取消，后面可以进一步细化
            {
                _logger.LogError(ex, "Python runner crashed. TaskId={TaskId}", req.TaskId);
                return BacktestRunResult.Failed($"Python runner crashed: {ex.Message}");
            }
        }
    }
}