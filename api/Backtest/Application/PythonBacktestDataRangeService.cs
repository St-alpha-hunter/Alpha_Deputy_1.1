using System.Diagnostics;
using System.Text.Json;
using api.Backtest.Interface;
using api.Backtest.Runner;
using Microsoft.Extensions.Options;

namespace api.Backtest.Application;

public sealed class PythonBacktestDataRangeService : IBacktestDataRangeService
{
    private const string DataRangeScript = "execute/python_runner/data_range.py";

    private readonly PythonBacktestRunnerOptions _options;
    private readonly ILogger<PythonBacktestDataRangeService> _logger;

    public PythonBacktestDataRangeService(
        IOptions<PythonBacktestRunnerOptions> options,
        ILogger<PythonBacktestDataRangeService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<BacktestDataRange> GetAsync(CancellationToken ct = default)
    {
        var workingDirectory = ResolveWorkingDirectory();
        var scriptPath = Path.GetFullPath(Path.Combine(workingDirectory, DataRangeScript));
        var dataDirectory = ResolveDataDirectory(workingDirectory);

        if (!File.Exists(scriptPath))
            throw new FileNotFoundException("Data range script was not found.", scriptPath);

        if (!Directory.Exists(dataDirectory))
            throw new DirectoryNotFoundException($"Backtest data directory was not found: {dataDirectory}");

        var psi = new ProcessStartInfo
        {
            FileName = _options.PythonExe,
            WorkingDirectory = workingDirectory,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };
        psi.ArgumentList.Add(scriptPath);
        psi.ArgumentList.Add("--data-dir");
        psi.ArgumentList.Add(dataDirectory);

        using var process = new Process { StartInfo = psi };
        try
        {
            _logger.LogInformation(
                "Reading BackTrader data range. PythonExe={PythonExe}, DataDirectory={DataDirectory}",
                _options.PythonExe,
                dataDirectory);

            if (!process.Start())
                throw new InvalidOperationException("Failed to start data range reader.");

            var stdoutTask = process.StandardOutput.ReadToEndAsync(ct);
            var stderrTask = process.StandardError.ReadToEndAsync(ct);
            await process.WaitForExitAsync(ct);
            var stdout = await stdoutTask;
            var stderr = await stderrTask;

            if (process.ExitCode != 0)
            {
                var details = string.IsNullOrWhiteSpace(stderr) ? stdout : stderr;
                throw new InvalidOperationException(
                    $"Data range reader exited with code {process.ExitCode}: {details.Trim()}");
            }

            var range = JsonSerializer.Deserialize<BacktestDataRange>(
                stdout,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (range is null || string.IsNullOrWhiteSpace(range.MinDate) || string.IsNullOrWhiteSpace(range.MaxDate))
                throw new InvalidOperationException("Data range reader returned invalid JSON.");

            return range;
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
                // Preserve the original error if process cleanup itself fails.
            }

            throw;
        }
    }

    private string ResolveWorkingDirectory()
    {
        if (!string.IsNullOrWhiteSpace(_options.WorkingDirectory))
            return Path.GetFullPath(_options.WorkingDirectory);

        return Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
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
