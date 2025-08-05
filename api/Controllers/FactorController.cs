using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Data;
using api.Dtos.Factor;
using api.Extensions;
using api.Helpers;
using api.Interfaces;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/factor")]
    [ApiController]
    public class FactorController : ControllerBase
    {
        private readonly IFactorRepository _factorRepo;

        public FactorController(IFactorRepository factorRepo)
        {
            _factorRepo = factorRepo;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllAsync([FromQuery] FactorQueryObject factorQuery)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var factors = await _factorRepo.GetAllAsync(factorQuery);
            var factorDto = factors.Select(f => f.ToFactorDto());
            return Ok(factorDto);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var factor = await _factorRepo.GetByIdAsync(id);
            if (factor == null)
            {
                return NotFound();
            }
            return Ok(factor.ToFactorDto());
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFactorDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var factor = createDto.ToEntity();
            await _factorRepo.CreateAsync(factor);
            return Ok(factor.ToFactorDto());
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] int id, UpdateFactorDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var factorModel = await _factorRepo.UpdateAsync(id, updateDto);
            if (factorModel == null)
                return NotFound();

            return Ok(factorModel.ToFactorDto());
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var factor = await _factorRepo.DeleteAsync(id);
            if (factor == null)
            {
                return NotFound("Factor does not exist");
            }
            return Ok(factor);
        }
        
    }
}