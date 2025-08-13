using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;               // ⬅️ 必须：Required, Key, Table
using System.ComponentModel.DataAnnotations.Schema;        // ⬅️ 必须：Table, Column

namespace api.Dtos.Asset
{
public class AssetUpdateDto
{
    [Required]
    public string Symbol { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
    [Required]
    public string Exchange { get; set; } = string.Empty;
    [Required]
    public long StartDate { get; set; }
    [Required]
    public long EndDate { get; set; }
    public long? AutoCloseDate { get; set; }
    public long? FirstTraded { get; set; }
}
}