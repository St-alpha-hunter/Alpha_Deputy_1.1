using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dtos.Asset;
using Npgsql.Replication;
using api.Models;
using api.Mappers;

namespace api.Mappers
{
    public static class AssetMappers
    {
        public static AssetDto ToAssetDto(this Asset assetModel)
        {
            return new AssetDto
            {
                Sid = assetModel.Sid,
                Symbol = assetModel.Symbol,
                AssetName = assetModel.AssetName,
                Exchange = assetModel.Exchange,
                StartDate = ((DateTimeOffset)assetModel.StartDate).ToUnixTimeSeconds(),
                EndDate = ((DateTimeOffset)assetModel.EndDate).ToUnixTimeSeconds()
            };
        }
        
//前面的是声明，后面的是方法名
        public static Asset ToAssetFromCreate(this AssetCreateDto assetModel, long sid)
        {
            return new Asset
            {
                Symbol = assetModel.Symbol,
                AssetName = assetModel.AssetName,
                Exchange = assetModel.Exchange,
                StartDate = DateTimeOffset.FromUnixTimeSeconds(assetModel.StartDate).UtcDateTime,
                EndDate = DateTimeOffset.FromUnixTimeSeconds(assetModel.EndDate).UtcDateTime
            };
            }
        
        public static void UpdateEntity(this AssetUpdateDto dto, Asset assetModel)
        {
            assetModel.Symbol = dto.Symbol;
            assetModel.AssetName = dto.AssetName;
            assetModel.Exchange = dto.Exchange;
            assetModel.StartDate = DateTimeOffset.FromUnixTimeSeconds(dto.StartDate).UtcDateTime;
            assetModel.EndDate = DateTimeOffset.FromUnixTimeSeconds(dto.EndDate).UtcDateTime;
        }

        
    }
}