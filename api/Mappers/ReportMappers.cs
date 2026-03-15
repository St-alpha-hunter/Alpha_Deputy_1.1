using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Report;
using Npgsql.Replication;
using api.Models;
using api.Mappers;
using api.Migrations;

///左边是entity，右边是dto
namespace api.Mappers
{
    public static class ReportMappers
    {
        public static ReportDto ToReportDto(this Report report)
        {
            return new ReportDto
            {
                ReportId = report.ReportId,
                AppUserId = report.AppUserId,
                StrategyName = report.StrategyName,
                ResultJson = report.ResultJson
            };
        }

        public static Report ToEntity(this CreateReportDto dto, string userId)
        {
            return new Report
            {
                ReportId = Guid.NewGuid(),
                AppUserId = userId,
                StrategyName = dto.StrategyName,
                ResultJson = dto.ResultJson
            };
        }


        public static Report ToUpdateEntity(this Report report, UpdateReportDto dto)
        {
            return new Report
            {
                ReportId = dto.ReportId,
                AppUserId = dto.AppUserId,
                StrategyName = dto.StrategyName,
                ResultJson = dto.ResultJson
            };
        }
    }
}