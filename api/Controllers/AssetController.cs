using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Helpers;
using api.Models;
using api.Mappers;
using api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using api.Service;
using api.Dtos.Asset;

namespace api.Controllers
{
    [Route("api/asset")]
    [ApiController]
    public class AssetController : ControllerBase
    {
        private readonly IAssetRepository _assetRepo;
        private readonly AssetSidService _sidService;
        public AssetController(IAssetRepository assetRepo ,AssetSidService sidService)
        {
            _assetRepo = assetRepo;
            _sidService = sidService;
        }

        [HttpGet("{Sid:long}", Name = "GetAssetBySid")]
        public async Task<IActionResult> GetBySid([FromRoute] long Sid)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var asset = await _assetRepo.GetByIdAsync(Sid);
            if (asset == null)
            {
                return NotFound();
            }
            return Ok(asset.ToAssetDto());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AssetCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            ///属性/类/方法 用大写，变量用小写 —— 不科学是错觉，其实是标准！
            //long sid = AssetSidService.GenerateNextSid();
            long sid = _sidService.GetOrCreateSid(createDto.Symbol);
            var assetModel = createDto.ToAssetFromCreate(sid);
            await _assetRepo.CreateAsync(assetModel);
            //名称注意要和上述的一致啊
            var routeUrl = Url.Link("GetAssetBySid", new { Sid = assetModel.Sid });
            return CreatedAtRoute("GetAssetBySid", new { Sid = assetModel.Sid }, assetModel.ToAssetDto());
        }


        [HttpPut]
        [Route("{Sid:long}")]
        public async Task<IActionResult> Update([FromRoute] long Sid, [FromBody] AssetUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var assetModel = await _assetRepo.UpdateAsync(Sid, updateDto);
            if (assetModel == null)
                return NotFound();

            return Ok(assetModel.ToAssetDto());
        }
    }
}