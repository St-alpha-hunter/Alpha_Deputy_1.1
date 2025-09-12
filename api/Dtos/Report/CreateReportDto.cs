using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using api.Models;

namespace api.Dtos.Report
{
    public class CreateReportDto
    {
        [Required]
        public string StrategyName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string MetricsJson { get; set; } = string.Empty;
        public string ChartBase64 { get; set; } = string.Empty;
        public string PositionsJson { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public api.Models.Report ToEntity(string appUserId)
        {
            return new api.Models.Report
            {
                Id = Guid.NewGuid(),
                AppUserId = appUserId,
                StrategyName = this.StrategyName,
                StartDate = this.StartDate,
                EndDate = this.EndDate,
                MetricsJson = this.MetricsJson,
                ChartBase64 = this.ChartBase64,
                PositionsJson = this.PositionsJson,
                Status = this.Status,
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}

