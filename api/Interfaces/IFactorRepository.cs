using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Factor;
using api.Helpers;
using api.Models;

namespace api.Interfaces
{
    public interface IFactorRepository
    {
        Task<List<Factor>> GetAllAsync(FactorQueryObject queryFactor);
        Task<Factor?> GetByIdAsync(FactorQueryObject queryFactor);
        Task<List<Factor>> GetFactorsByCategoryAsync(string category);
        Task<Factor> CreateAsync(Factor factorModel);
        Task<Factor?> UpdateAsync(int id, UpdateFactorDto updateDto);
        Task<Factor?> DeleteAsync(int id);
    }
}