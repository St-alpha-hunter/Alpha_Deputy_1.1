using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Interfaces;
using api.Models;
using api.Dtos.Report;
using api.Mappers;
using api.Data;
using Microsoft.EntityFrameworkCore;

namespace api.Repository
{
    public class ReportRepository : IReportRepository
    {
        private readonly ApplicationDBContext _context;
        public ReportRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<Report>> GetAllAsync()
        {
            return await _context.Reports.ToListAsync();
        }

        public async Task<Report?> GetByIdAsync(Guid id)
        {
            return await _context.Reports.FindAsync(id);
        }

        public async Task<Report> CreateAsync(Report report)
        {
            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<Report?> UpdateAsync(Guid id, UpdateReportDto updateDto)
        {
            var existing = await _context.Reports.FindAsync(id);
            if (existing == null) return null;
            existing.AppUserId = updateDto.AppUserId;
            existing.StrategyName = updateDto.StrategyName;
            existing.ResultJson = updateDto.ResultJson;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<Report?> DeleteAsync(Guid id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null) return null;
            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();
            return report;
        }
        
    }
}