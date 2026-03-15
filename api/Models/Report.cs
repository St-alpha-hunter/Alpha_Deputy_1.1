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
        public Guid ReportId { get; set; }
        [Required]
        public string AppUserId { get; set; } = string.Empty; // 外键，关联 AppUser
        [Required]
        public string StrategyName { get; set; } = string.Empty;
        public string? ResultJson { get; set; }

    }
}