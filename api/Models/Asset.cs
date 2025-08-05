using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    [Table("Asset")]
    public class Asset
    {
    [Key]
    public long Sid { get; set; }  // 主键：Zipline 内部使用的 ID
    public string Symbol { get; set; } = string.Empty;  // 股票代码
    public string AssetName { get; set; } = string.Empty; // 公司名称，可选
    public string Exchange { get; set; } = string.Empty;  // 如 NYSE、NASDAQ
    public  DateTime StartDate { get; set; }  // Unix 或 UTC 时间戳
    public DateTime EndDate { get; set; }
    public DateTime? AutoCloseDate { get; set; }
    public DateTime? FirstTraded { get; set; }
    }
}