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
        public string? ResultJson { get; set; }

        // public api.Models.Report ToEntity(string appUserId)
        // {
        //     return new api.Models.Report
        //     {
        //         Id = Guid.NewGuid(),
        //         AppUserId = appUserId,
        //         StrategyName = this.StrategyName,
        //         ResultJson = this.ResultJson,

        //     };
        // }
    }
}

//Request DTO 本质是：定义客户端请求 JSON 的结构
//Response DTO：定义服务器返回给客户端 JSON 的结构