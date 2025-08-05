using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    [Table("Factors")]
    public class Factor
    {
        [Key]
        public int Id { get; set; } // 或 Guid 看你选哪个
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ComputeCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool Enabled { get; set; } = false;

        // 新增：用户约束
        [Required]
        public string AppUserId { get; set; } = string.Empty;
        public AppUser AppUser { get; set; }

    }
}