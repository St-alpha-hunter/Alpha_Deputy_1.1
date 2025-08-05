using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Stock
{
    public class FMPStock
    {
        public string symbol { get; set; }
        public string companyName { get; set; }
        public string industry { get; set; }
        public long marketCap { get; set; } // 注意字段名
        public double lastDividend { get; set; } // 注意字段名
    }
}