using System.Threading.Tasks;
using api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/company")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly IFMPService _fmpService;

        public CompanyController(IFMPService fmpService)
        {
            _fmpService = fmpService;
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
