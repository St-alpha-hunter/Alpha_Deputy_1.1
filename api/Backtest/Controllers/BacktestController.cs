using Microsoft.AspNetCore.Mvc;
using api.Backtest.Interface;
using api.Backtest.Dto;
using api.Models;
using api.Extensions;
using api.Interfaces;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;




namespace api.Backtest.Controllers
{
    [ApiController]
    [Route("api/backtests")]
    public class BacktestsController : ControllerBase
    {
        private readonly IBacktestService _service;

        private readonly ILogger<BacktestsController> _logger;
        private readonly UserManager<AppUser> _userManager;
        public BacktestsController(UserManager<AppUser> userManager, IBacktestService service, ILogger<BacktestsController> logger)
        {
            _userManager = userManager;
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// 创建回测任务
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CreateBacktestResponse>> Create(
             [FromBody] CreateBacktestRequest request,
             CancellationToken ct)
             
         {
            if (!TryGetUserId(out var userId)) return Unauthorized("Invalid user ID in token." );

                _logger.LogInformation(
                "接收到的输入Inputs received: {Inputs}",
                System.Text.Json.JsonSerializer.Serialize(request.StrategySpec.Signal.Inputs)
            );
            var response = await _service.CreateAsync(userId, request, ct);
            return Ok(response);
         }

        // public async Task<ActionResult<CreateBacktestResponse>> Create([FromBody] CreateBacktestRequest req, CancellationToken ct)
        // {
        //     var username = User.GetUsername();
        //     var appUser = await _userManager.FindByNameAsync(username);

        //     var resp = await _service.CreateAsync(appUser, req, ct);
        //     return Ok(resp);
        // }






        /// <summary>
        /// 查询回测任务
        /// </summary>
         [HttpGet("{taskId:guid}")]
         [Authorize]
         public async Task<ActionResult<BacktestTaskResponse>> Get(
             [FromBody] CreateBacktestResponse response,
             [FromRoute] Guid taskId,
             CancellationToken ct)
         {
             if (!TryGetUserId(out var userId)) return Unauthorized("Invalid user ID in token." );

             var result = await _service.GetAsync(userId, taskId, ct);
             Console.WriteLine($"UserId = {userId}");
             Console.WriteLine($"Type = {userId.GetType()}");
             if (result is null)
                 return NotFound();

             return Ok(result);
         }


        // [HttpGet("{taskId:guid}")]
        // [Authorize]
        // public async Task<ActionResult<BacktestTaskResponse>> Get([FromRoute] Guid taskId, CancellationToken ct)
        // {
        //     var username = User.GetUsername();
        //     var appUser = await _userManager.FindByNameAsync(username);

        //     var resp = await _service.GetAsync(userId, taskId, ct);
        //     if (resp is null)
        //         return NotFound();

        //     return Ok(resp);
        // }

        private bool TryGetUserId(out Guid userId)
        {
            var raw = User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(raw, out userId);
        }

     }
}
