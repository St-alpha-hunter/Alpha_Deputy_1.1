using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace api.Backtest.Application
{
    public static class Idempotency
    {
        public static string ComputeKey(Guid userId, object strategySpec, object @params, string dataVersion)
        {
            var payload = JsonSerializer.Serialize(new { userId, strategySpec, @params, dataVersion });
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }
}


// public static class Idempotency
// {
//     public static string ComputeKey(object strategySpec, object @params, string dataVersion)
//     {
//         var specJson = JsonSerializer.Serialize(strategySpec);
//         var paramsJson = JsonSerializer.Serialize(@params);

//         var raw = $"{dataVersion}|{specJson}|{paramsJson}";

//         using var sha = SHA256.Create();
//         var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));

//         return Convert.ToHexString(bytes); // .NET 6+
//     }
// }


//幂等性有两层 (1) 第一层：逻辑判断 （2）第二层：数据库唯一索引