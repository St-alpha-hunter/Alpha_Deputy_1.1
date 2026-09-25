using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Helpers
{
    public class FactorQueryObject
    {
        public int Id { get; set; }
        public string Query { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsDecsending { get; set; } = true;
        // 默认只返回已启用的因子；管理/排查时传 includeDisabled=true 查全部
        public bool IncludeDisabled { get; set; } = false;
    }
}