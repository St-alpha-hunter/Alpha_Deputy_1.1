using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using api.Interfaces;
using api.Data;
using api.Models;
using api.Helpers;
using Microsoft.AspNetCore.Http.HttpResults;
using api.Dtos.Factor;
using api.Mappers;

namespace api.Repository
{
    public class FactorRepository : IFactorRepository
    {
        private readonly ApplicationDBContext _context;
        public FactorRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<Factor> CreateAsync(Factor factorModel)
        {
            var exists = await _context.Factors.AnyAsync(f => f.Name == factorModel.Name);
            if (exists)
            {
                return null; // 或者抛出自定义异常
            }

            await _context.Factors.AddAsync(factorModel);
            await _context.SaveChangesAsync();
            return factorModel;
        }

        public async Task<Factor?> UpdateAsync(int id, UpdateFactorDto updateDto)
        {
            var existing = await _context.Factors.FindAsync(id);
            if (existing == null) return null;

            existing.UpdateEntity(updateDto);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<Factor?> DeleteAsync(int id)
        {
            var factorModel = await _context.Factors.FirstOrDefaultAsync(x => x.Id == id);
            if (factorModel == null)
            {
                return null;
            }
            _context.Factors.Remove(factorModel);
            await _context.SaveChangesAsync();
            return factorModel;
        }

        public async Task<List<Factor>> GetAllAsync(FactorQueryObject queryFactor)
        {
            var factorModel = _context.Factors.AsQueryable();
            if (queryFactor.Id != 0)
            {
                factorModel = factorModel.Where(f => f.Id == queryFactor.Id);
            };

            if (!string.IsNullOrEmpty(queryFactor.Category))
            {
                factorModel = factorModel.Where(f => f.Category == queryFactor.Category);
            }

            if (queryFactor.IsDecsending == true)
            {
                factorModel = factorModel.OrderByDescending(f => f.CreatedAt);
            }
            return await factorModel.ToListAsync();
        }

        public async Task<Factor?> GetByIdAsync(int id) 
        {
            return await _context.Factors.FirstOrDefaultAsync(f => f.Id == id);
        }

    }
}