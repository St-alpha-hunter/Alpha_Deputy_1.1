using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    [Table("Reports")]
    public class Report
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string AppUserId { get; set; } = string.Empty; // 外键，关联 AppUser
        [Required]
        public string StrategyName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string MetricsJson { get; set; } = string.Empty;
        public string ChartBase64 { get; set; } = string.Empty;
        public string PositionsJson { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = string.Empty;

        // 导航属性
        public AppUser AppUser { get; set; }

    }
}