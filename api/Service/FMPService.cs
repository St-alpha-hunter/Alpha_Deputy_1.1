using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Stock;
using api.Interfaces;
using api.Mappers;
using api.Models;
using Newtonsoft.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace api.Service
{
    public class FMPService : IFMPService
    {
        private readonly HttpClient _httpClient;
        // 生产环境通过 FMP_API_KEY 环境变量注入密钥；本地开发回退到 appsettings.json 中的 FMPKey。
        // 全类唯一的密钥来源，所有请求（含原有的 FindStockBySymbolAsync）统一从这里取。
        private readonly string _fmpApiKey;
        public FMPService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            var envKey = config["FMP_API_KEY"];
            // ?? 只在左值为 null 时回退，环境变量存在但为空字符串时不会触发，
            // 这里显式判断空/空白，避免拿到 "" 当作有效密钥发给 FMP。
            _fmpApiKey = string.IsNullOrWhiteSpace(envKey) ? config["FMPKey"] : envKey;
        }
        public async Task<Stock> FindStockBySymbolAsync(string symbol)
        {
            try
            {
                var result = await _httpClient.GetAsync($"https://financialmodelingprep.com/api/v3/profile/{symbol}?apikey={_fmpApiKey}");
                if (result.IsSuccessStatusCode)
                {
                    var content = await result.Content.ReadAsStringAsync();
                    var tasks = JsonConvert.DeserializeObject<FMPStock[]>(content);
                    var stock = tasks[0];
                    if (stock != null)
                    {
                     return stock.ToStockFromFMP();
                    }
                    return null;
                }
                return null;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        // 原样转发 FMP 响应的状态码与响应体，供 CompanyController 直接透传给前端。
        private async Task<(int StatusCode, string Body)> GetRawAsync(string url)
        {
            try
            {
                var response = await _httpClient.GetAsync(url);
                var body = await response.Content.ReadAsStringAsync();
                return ((int)response.StatusCode, body);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return (502, "{\"error\":\"FMP request failed\"}");
            }
        }

        public Task<(int StatusCode, string Body)> SearchCompaniesAsync(string query)
        {
            var url = $"https://financialmodelingprep.com/api/v3/search?query={Uri.EscapeDataString(query)}&limit=10&exchange=NASDAQ&apikey={_fmpApiKey}";
            return GetRawAsync(url);
        }

        public Task<(int StatusCode, string Body)> GetCompanyProfileAsync(string symbol)
        {
            var url = $"https://financialmodelingprep.com/api/v3/profile/{Uri.EscapeDataString(symbol)}?apikey={_fmpApiKey}";
            return GetRawAsync(url);
        }

        public Task<(int StatusCode, string Body)> GetKeyMetricsAsync(string symbol)
        {
            var url = $"https://financialmodelingprep.com/stable/key-metrics?symbol={Uri.EscapeDataString(symbol)}&apikey={_fmpApiKey}";
            return GetRawAsync(url);
        }

        public Task<(int StatusCode, string Body)> GetIncomeStatementAsync(string symbol)
        {
            var url = $"https://financialmodelingprep.com/api/v3/income-statement/{Uri.EscapeDataString(symbol)}?apikey={_fmpApiKey}";
            return GetRawAsync(url);
        }

        public Task<(int StatusCode, string Body)> GetBalanceSheetAsync(string symbol)
        {
            var url = $"https://financialmodelingprep.com/stable/balance-sheet-statement?symbol={Uri.EscapeDataString(symbol)}&apikey={_fmpApiKey}";
            return GetRawAsync(url);
        }

        public Task<(int StatusCode, string Body)> GetCashFlowAsync(string symbol)
        {
            var url = $"https://financialmodelingprep.com/stable/cash-flow-statement?symbol={Uri.EscapeDataString(symbol)}&apikey={_fmpApiKey}";
            return GetRawAsync(url);
        }

        public Task<(int StatusCode, string Body)> GetCompDataAsync(string symbol)
        {
            var url = $"https://financialmodelingprep.com/stable/profile?symbol={Uri.EscapeDataString(symbol)}&apikey={_fmpApiKey}";
            return GetRawAsync(url);
        }

        public Task<(int StatusCode, string Body)> GetTenKAsync(string? cik, string? symbol, string? from, string? to, int? page, int? limit)
        {
            var query = new List<string>();
            if (!string.IsNullOrEmpty(cik)) query.Add($"cik={Uri.EscapeDataString(cik)}");
            if (!string.IsNullOrEmpty(symbol)) query.Add($"symbol={Uri.EscapeDataString(symbol)}");
            if (!string.IsNullOrEmpty(from)) query.Add($"from={Uri.EscapeDataString(from)}");
            if (!string.IsNullOrEmpty(to)) query.Add($"to={Uri.EscapeDataString(to)}");
            if (page.HasValue) query.Add($"page={page.Value}");
            if (limit.HasValue) query.Add($"limit={limit.Value}");
            query.Add($"apikey={_fmpApiKey}");

            var url = $"https://financialmodelingprep.com/stable/sec-filings-search/cik?{string.Join("&", query)}";
            return GetRawAsync(url);
        }
    }
}