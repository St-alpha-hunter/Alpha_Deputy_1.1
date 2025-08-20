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
    }
}