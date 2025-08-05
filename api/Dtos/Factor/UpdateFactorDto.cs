using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Factor
{
    public class UpdateFactorDto
    {
        [Required]
        [MinLength(5, ErrorMessage = "Name must be 5 characters")]
        [MaxLength(50, ErrorMessage = "Name cannot be over 50 character")]
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;

        [MinLength(20, ErrorMessage = "Description must be 20 characters")]
        [MaxLength(100, ErrorMessage = "Description cannot be over 100 character")]
        public string Description { get; set; } = string.Empty;
        public string ComputeCode { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool Enabled { get; set; } = false;
    }
}