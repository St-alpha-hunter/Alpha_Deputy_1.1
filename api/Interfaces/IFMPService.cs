using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;

namespace api.Interfaces
{
    public interface IFMPService
    {
        Task<Stock> FindStockBySymbolAsync(string symbol);

        // 以下方法代理原本由前端直接发往 financialmodelingprep.com 的请求，
        // 原样转发 FMP 的状态码/内容类型/响应体，保持前端行为不变。
        Task<(int StatusCode, string Body)> SearchCompaniesAsync(string query);
        Task<(int StatusCode, string Body)> GetCompanyProfileAsync(string symbol);
        Task<(int StatusCode, string Body)> GetKeyMetricsAsync(string symbol);
        Task<(int StatusCode, string Body)> GetIncomeStatementAsync(string symbol);
        Task<(int StatusCode, string Body)> GetBalanceSheetAsync(string symbol);
        Task<(int StatusCode, string Body)> GetCashFlowAsync(string symbol);
        Task<(int StatusCode, string Body)> GetCompDataAsync(string symbol);
        Task<(int StatusCode, string Body)> GetTenKAsync(string? cik, string? symbol, string? from, string? to, int? page, int? limit);
    }
}