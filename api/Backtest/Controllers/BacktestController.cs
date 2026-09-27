using Microsoft.AspNetCore.Mvc;
using api.Backtest.Interface;
using api.Backtest.Dto;
using api.Backtest.Contracts;
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
        private readonly IBacktestDataRangeService _dataRangeService;
        public BacktestsController(
            UserManager<AppUser> userManager,
            IBacktestService service,
            IBacktestDataRangeService dataRangeService,
            ILogger<BacktestsController> logger)
        {
            _userManager = userManager;
            _service = service;
            _dataRangeService = dataRangeService;
            _logger = logger;
        }

        /// <summary>
        /// 返回当前 parquet 数据可用于回测的日期上下限。
        /// </summary>
        [HttpGet("data-range")]
        [AllowAnonymous]
        public async Task<ActionResult<BacktestDataRange>> GetDataRange(CancellationToken ct)
        {
            try
            {
                return Ok(await _dataRangeService.GetAsync(ct));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "读取 BackTrader 数据日期范围失败");
                return Problem(
                    detail: "Unable to read the available backtest data range.",
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
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
                System.Text.Json.JsonSerializer.Serialize(request.StrategySpec)
            );

            // 业务校验（之前 StrategySpecValidator 写好了但没被调用，权重全 0 的回测也能提交）
            if (request.StrategySpec is null)
                return BadRequest("strategySpec is required.");

            var validationErrors = StrategySpecValidator.Validate(request.StrategySpec);
            if (validationErrors.Count > 0)
            {
                foreach (var error in validationErrors)
                    ModelState.AddModelError(error.Field, error.Message);
                return ValidationProblem(ModelState);
            }

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
             // [FromBody] CreateBacktestResponse response,
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

        private bool TryGetUserId(out Guid userId)
        {
            var raw = User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(raw, out userId);
        }

     }
}
