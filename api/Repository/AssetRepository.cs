using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Interfaces;
using api.Models;
using api.Dtos.Stock;
using api.Helpers;
using api.Dtos.Asset;
using api.Mappers;

namespace api.Repository
{
    public class AssetRepository : IAssetRepository
    {
        private readonly ApplicationDBContext _context;
        public AssetRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<Asset> CreateAsync(Asset assetModel)
        {
            await _context.Assets.AddAsync(assetModel);
            await _context.SaveChangesAsync();
            return assetModel;
        }
        public async Task<Asset?> GetByIdAsync(long Sid)
        {
            return await _context.Assets.FirstOrDefaultAsync(i => i.Sid == Sid);
        }

        public async Task<Asset?> UpdateAsync(long sid, AssetUpdateDto updateDto)
        {
            var existingAsset = await _context.Assets.FindAsync(sid);
            if (existingAsset == null)
                return null;

            // 使用扩展方法更新字段
            updateDto.UpdateEntity(existingAsset);

            await _context.SaveChangesAsync();
            return existingAsset;
        }

        public Task<bool> AssetExists(long Sid)
        {
            return _context.Assets.AnyAsync(a => a.Sid == Sid);
        }
    }
}