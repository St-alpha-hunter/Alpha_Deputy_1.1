using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;
using api.Dtos.Report;

namespace api.Interfaces
{
    public interface IReportRepository
    {
        Task<List<Report>> GetAllAsync();
        Task<Report?> GetByIdAsync(Guid id);
        Task<Report> CreateAsync(Report report);
        Task<Report?> UpdateAsync(Guid id, UpdateReportDto updateDto);
        Task<Report?> DeleteAsync(Guid id);
    }
}