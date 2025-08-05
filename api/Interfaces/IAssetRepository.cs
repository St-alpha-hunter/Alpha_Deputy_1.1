using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;
using api.Dtos.Asset;
using api.Helpers;

namespace api.Interfaces
{
    public interface IAssetRepository
    {
        Task<Asset?> GetByIdAsync(long Sid);
        Task<Asset> CreateAsync(Asset assetModel);
        Task<Asset> UpdateAsync(long Sid, AssetUpdateDto updateDto);
    }
}