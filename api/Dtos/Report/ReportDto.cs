using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Report
{
    public class ReportDto
    {
        [Key]
        public Guid ReportId { get; set; }
        [Required]
        public string AppUserId { get; set; } = string.Empty; // 外键，关联 AppUser
        [Required]
        public string StrategyName { get; set; } = string.Empty;

        public string? ResultJson { get; set; }
    }
}