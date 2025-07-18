using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    public class Portfolio
    {
        public int Id { get; set; }
        public required string AppUserId { get; set; }
        public int StockId { get; set; }
        public required Stock Stock { get; set; }
    }
}