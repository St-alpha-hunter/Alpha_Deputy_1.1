using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Report;
using Npgsql.Replication;
using api.Models;
using api.Mappers;
using api.Migrations;

namespace api.Mappers
{
    public static class ReportMappers
    {
        public static ReportDto ToReportDto(this Report report)
        {
            return new ReportDto
            {
                Id = report.Id,
                StrategyName = report.StrategyName,
                StartDate = report.StartDate,
                EndDate = report.EndDate,
                MetricsJson = report.MetricsJson,
                ChartBase64 = report.ChartBase64,
                PositionsJson = report.PositionsJson,
                CreatedAt = report.CreatedAt,
                Status = report.Status
            };
        }

        public static Report ToEntity(this CreateReportDto dto, string userId)
        {
            return new Report
            {
                Id = Guid.NewGuid(),
                AppUserId = userId,
                StrategyName = dto.StrategyName,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                MetricsJson = dto.MetricsJson,
                ChartBase64 = dto.ChartBase64,
                PositionsJson = dto.PositionsJson,
                CreatedAt = DateTime.UtcNow,
                Status = dto.Status
            };
        }


        public static void UpdateEntity(this Report report, UpdateReportDto dto)
        {
            report.StrategyName = dto.StrategyName;
            report.StartDate = dto.StartDate;
            report.EndDate = dto.EndDate;
            report.MetricsJson = dto.MetricsJson;
            report.ChartBase64 = dto.ChartBase64;
            report.PositionsJson = dto.PositionsJson;
            report.Status = dto.Status;
        }

    }
}