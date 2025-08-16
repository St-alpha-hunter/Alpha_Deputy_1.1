using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Npgsql.Replication;
using api.Models;
using api.Mappers;
using api.Dtos.Factor;

namespace api.Mappers
{
    public static class FactorMappers
    {
        //接收
        public static FactorDto ToFactorDto(this Factor factorModel)
        {
            return new FactorDto
            {
                Id = factorModel.Id,
                Name = factorModel.Name,
                Category = factorModel.Category,
                Description = factorModel.Description,
                ComputeCode = factorModel.ComputeCode,
                CreatedAt = factorModel.CreatedAt,
                UpdatedAt = factorModel.UpdatedAt,
                Enabled = factorModel.Enabled
            };
        }
        //创建
        public static Factor ToEntity(this CreateFactorDto createDto)
        {
            return new Factor
            {
                Name = createDto.Name,
                Category = createDto.Category,
                Description = createDto.Description,
                ComputeCode = createDto.ComputeCode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Enabled = createDto.Enabled
            };
        }

        // 更新 Dto => Entity
        public static void UpdateEntity(this Factor factorModel, UpdateFactorDto updateDto)
        {
            factorModel.Name = updateDto.Name;
            factorModel.Category = updateDto.Category;
            factorModel.Description = updateDto.Description;
            factorModel.ComputeCode = updateDto.ComputeCode;
            factorModel.UpdatedAt = DateTime.UtcNow;
            factorModel.Enabled = updateDto.Enabled;
        }
        
    }
}