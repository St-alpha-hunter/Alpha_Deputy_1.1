using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Report
{
    public class CreateReportDto
    {
        [Required]
        public string StrategyName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string MetricsJson { get; set; }
        public string ChartBase64 { get; set; }
        public string PositionsJson { get; set; }
        public string Status { get; set; }
    }
}