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
using api.Dtos.Stock;
using api.Interfaces;
using Microsoft.AspNetCore.Authorization;
namespace api.Controllers
{
    [Route("api/stock")]
    [ApiController]
    public class StockController : ControllerBase
    {

        private readonly ApplicationDBContext _context;
        private readonly IStockRepository _stockRepo;
        public StockController(ApplicationDBContext context, IStockRepository stockRepo)
        {
            _stockRepo = stockRepo;
            _context = context;
        }


        //查询所有的
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll([FromQuery] QueryObject query)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var stocks = await _stockRepo.GetAllAsync(query);
            var stockDto = stocks.Select(s => s.ToStockDto()).ToList();
            return Ok(stockDto);
        }


        //按照id查询
        [HttpGet("{id:int}", Name = "GetStockById")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var stock = await _stockRepo.GetByIdAsync(id);

            if (stock == null)
            {
                return NotFound();
            }

            return Ok(stock.ToStockDto());
        }


        //创立
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStockRequestDtos stockDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var stockModel = stockDto.ToStockFromCreateDTO();
            await _stockRepo.CreateAsync(stockModel);
            var routeUrl = Url.Link("GetStockById", new { id = stockModel.Id });
            Console.WriteLine("👉看这里 URL = " + routeUrl);
            return CreatedAtRoute("GetStockById", new { id = stockModel.Id }, stockModel.ToStockDto());
        }

        //更新stock
        [HttpPut]
        [Route("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateStockRequestDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var stockModel = await _context.Stock.FirstOrDefaultAsync(x => x.Id == id);

            if (stockModel == null)
            {
                return NotFound();
            }
            stockModel.Symbol = updateDto.Symbol;
            stockModel.CompanyName = updateDto.CompanyName;
            stockModel.Purchase = updateDto.Purchase;
            stockModel.LastDiv = updateDto.LastDiv;
            stockModel.Industry = updateDto.Industry;
            stockModel.MarketCap = updateDto.MarketCap;

            await _context.SaveChangesAsync();
            return Ok(stockModel.ToStockDto());
        }

        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var stockModel = await _context.Stock.FirstOrDefaultAsync(x => x.Id == id);

            if (stockModel == null)
            {
                return NotFound();
            }

            _context.Stock.Remove(stockModel);
            await _context.SaveChangesAsync();
            return NoContent();
        }


    }
}