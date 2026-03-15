using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using api.Interfaces;
using api.Dtos.Report;
using api.Mappers;
using api.Models;
using api.Extensions;
using Microsoft.AspNetCore.Identity;

namespace api.Controllers
{
    [Route("api/report")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportRepository _reportRepo;
        private readonly UserManager<AppUser> _userManager;
        public ReportController(IReportRepository reportRepo, UserManager<AppUser> userManager)
        {
            _reportRepo = reportRepo;
            _userManager = userManager;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _reportRepo.GetAllAsync();
            var reportDtos = reports.Select(r => r.ToReportDto());
            return Ok(reportDtos);
        }

        [HttpGet("{reportId}")]
        public async Task<IActionResult> GetById([FromRoute] Guid reportId)
        {
            var report = await _reportRepo.GetByIdAsync(reportId);
            if (report == null) return NotFound();
            return Ok(report.ToReportDto());
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateReportDto createDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            // 假设你有用户系统，这里获取当前用户Id
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);
            if (appUser == null) return Unauthorized();
            var report = createDto.ToEntity(appUser.Id);
            await _reportRepo.CreateAsync(report);
            return Ok(report.ToReportDto());
        }



        [HttpPut("{reportId}")]
        public async Task<IActionResult> Update([FromRoute] Guid reportId, [FromBody] UpdateReportDto updateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updated = await _reportRepo.UpdateAsync(reportId, updateDto);
            if (updated == null) return NotFound();
            return Ok(updated.ToReportDto());
        }

        [HttpDelete("{reportId}")]
        public async Task<IActionResult> Delete([FromRoute] Guid reportId)
        {
            var deleted = await _reportRepo.DeleteAsync(reportId);
            if (deleted == null) return NotFound();
            return Ok(deleted.ToReportDto());
        }

    }
}