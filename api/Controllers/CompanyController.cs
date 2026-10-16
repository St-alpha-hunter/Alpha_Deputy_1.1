using System;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using api.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace api.Controllers
{
    [Route("api/company")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly IFMPService _fmpService;
        private readonly IPriceHistoryService _priceHistoryService;   // [股价走势 2026-10-16]
        private readonly ILogger<CompanyController> _logger;

        // [股价走势 2026-10-16] 代码只允许大写字母、数字和 "-"（本地文件名就是这样，如 BRK-B）。
        // 代码会被拼进文件路径，必须先校验，防止有人传 "../../xxx" 读服务器上的其他文件
        private static readonly Regex SymbolPattern = new("^[A-Z0-9-]{1,10}$", RegexOptions.Compiled);

        public CompanyController(
            IFMPService fmpService,
            IPriceHistoryService priceHistoryService,
            ILogger<CompanyController> logger)
        {
            _fmpService = fmpService;
            _priceHistoryService = priceHistoryService;
            _logger = logger;
        }

        /// <summary>
        /// [股价走势 2026-10-16] 单只股票的全部日线（复权价），数据来自 pipeline 生成的 backtest_data，和回测用的是同一份。
        /// 需要登录（Program.cs 设了默认需要登录）。
        /// 200：按列组织的行情；400：代码格式不对；404：本地没有这只股票的数据；503：读取失败
        /// </summary>
        [HttpGet("price-history/{symbol}")]
        public async Task<IActionResult> GetPriceHistory([FromRoute] string symbol, CancellationToken ct)
        {
            // 规范化：大写；BRK.B 这种写法转成文件名用的 BRK-B
            var normalized = (symbol ?? "").Trim().ToUpperInvariant().Replace('.', '-');
            if (!SymbolPattern.IsMatch(normalized))
                return BadRequest("Invalid symbol.");

            try
            {
                var history = await _priceHistoryService.GetDailyAsync(normalized, ct);
                return history is null
                    ? NotFound($"No local price data for {normalized}.")
                    : Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "读取股价走势失败 Symbol={Symbol}", normalized);
                return Problem(
                    detail: "Unable to load price history.",
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        }

        // 原样转发 FMP 的状态码/内容类型/响应体，保持前端现有的成功与错误处理逻辑不变
        // （例如 getTenk 依赖 404 状态码来判断“无报告”）。
        private IActionResult Proxy((int StatusCode, string Body) result)
        {
            return new ContentResult
            {
                StatusCode = result.StatusCode,
                Content = result.Body,
                ContentType = "application/json"
            };
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            return Proxy(await _fmpService.SearchCompaniesAsync(query));
        }

        [HttpGet("profile/{symbol}")]
        public async Task<IActionResult> GetProfile([FromRoute] string symbol)
        {
            return Proxy(await _fmpService.GetCompanyProfileAsync(symbol));
        }

        [HttpGet("key-metrics")]
        public async Task<IActionResult> GetKeyMetrics([FromQuery] string symbol)
        {
            return Proxy(await _fmpService.GetKeyMetricsAsync(symbol));
        }

        [HttpGet("income-statement/{symbol}")]
        public async Task<IActionResult> GetIncomeStatement([FromRoute] string symbol)
        {
            return Proxy(await _fmpService.GetIncomeStatementAsync(symbol));
        }

        [HttpGet("balance-sheet")]
        public async Task<IActionResult> GetBalanceSheet([FromQuery] string symbol)
        {
            return Proxy(await _fmpService.GetBalanceSheetAsync(symbol));
        }

        [HttpGet("cash-flow")]
        public async Task<IActionResult> GetCashFlow([FromQuery] string symbol)
        {
            return Proxy(await _fmpService.GetCashFlowAsync(symbol));
        }

        [HttpGet("comp-data")]
        public async Task<IActionResult> GetCompData([FromQuery] string symbol)
        {
            return Proxy(await _fmpService.GetCompDataAsync(symbol));
        }

        [HttpGet("tenk")]
        public async Task<IActionResult> GetTenK(
            [FromQuery] string? cik,
            [FromQuery] string? symbol,
            [FromQuery] string? from,
            [FromQuery] string? to,
            [FromQuery] int? page,
            [FromQuery] int? limit)
        {
            return Proxy(await _fmpService.GetTenKAsync(cik, symbol, from, to, page, limit));
        }
    }
}
