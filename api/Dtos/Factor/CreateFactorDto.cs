using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.Factor
{
    public class CreateFactorDto
    {
        [Required]
        [MinLength(5, ErrorMessage = "Name must be 5 characters")]
        [MaxLength(50, ErrorMessage = "Name cannot be over 50 character")]
        public string Name { get; set; } = string.Empty;
        [Required]
        [MaxLength(50)]
        public string CodeKey { get; set; } = string.Empty;
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