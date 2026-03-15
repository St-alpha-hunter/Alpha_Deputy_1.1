using api.Data;
using api.Interfaces;
using api.Service;
using api.Repository;
using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using api.Contracts;
using api.Backtest.Application;
using api.Backtest.Interface;
using api.Backtest.Infrastructure.Queue;
using api.Backtest.Infrastructure.Storage;
using api.Backtest.Contracts;
using api.Backtest.Runner;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

//
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Demo API", Version = "v1" });

    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    option.AddSecurityRequirement(new OpenApiSecurityRequirement
{
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        new string[] {}
    }
});

});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        //options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new EnumMemberJsonConverterFactory());
    });
// .AddNewtonsoftJson(options =>
// {
//     options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
//     options.SerializerSettings.Converters.Add(new Newtonsoft.Json.Converters.StringEnumConverter());
// });


builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 12;
})
.AddEntityFrameworkStores<ApplicationDBContext>();


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
    options.DefaultChallengeScheme =
    options.DefaultForbidScheme =
    options.DefaultScheme =
    options.DefaultSignInScheme =
    options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"])
        )
    };
});

//
// 1️⃣ 数据库（EF Core）
//

builder.Services.AddDbContext<ApplicationDBContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<IFactorRepository, FactorRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IBacktestRepository, BacktestRepository>();


// 2️⃣ 回测服务

builder.Services.AddScoped<IBacktestService, BacktestService>();

// 4️⃣ 回测队列（当前 InMemory 实现）
//   以后换成 Redis / RabbitMQ 只改这一行

builder.Services.AddSingleton<IBacktestQueue>(_ => new InMemoryBacktestQueue(_.GetRequiredService<ILogger<InMemoryBacktestQueue>>(), capacity: 10_000));

// 5️⃣ 回测执行器（当前假实现）
builder.Services.AddScoped<IBacktestRunner, PythonBacktestRunner>();


//注册环境调用PythonRunner的配置项
builder.Services.Configure<PythonBacktestRunnerOptions>(
    builder.Configuration.GetSection("PythonBacktestRunner"));



// 6️⃣ 回测结果存储（当前本地文件实现）
// 结果目录建议放到配置里：例如 "Storage:BacktestResultsDir"
var resultsDir = builder.Configuration["Storage:BacktestResultsDir"]
                ?? Path.Combine(AppContext.BaseDirectory, "backtest-results");

builder.Services.AddSingleton<IBacktestResultStore>(_ => new LocalFileBacktestResultStore(resultsDir));


// 7️⃣ 回测工作器选项
builder.Services.AddSingleton(new BacktestWorkerOptions
{
    MaxParallelism = 2,
    DequeueWait = TimeSpan.FromSeconds(2),
    MaxAttempts = 3,
    BaseRetryDelay = TimeSpan.FromSeconds(2),
});


// 8️⃣ 回测工作器（后台服务），一直在监听队列并执行回测任务
builder.Services.AddHostedService<BacktestWorker>();


//
// 其他服务
//

builder.Services.AddScoped<IFMPService, FMPService>();
builder.Services.AddHttpClient<IFMPService, FMPService>();

builder.Services.AddSingleton<AssetSidService>();

var app = builder.Build();

//
// 7️⃣ 中间件
//

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/healthz", () => Results.Ok("Healthy"));

app.UseHttpsRedirection();

// app.UseCors(x => x
//     .AllowAnyMethod()
//     .AllowAnyHeader()
//     .AllowCredentials()
//     .SetIsOriginAllowed(origin => true));

app.UseCors(x => x
    .WithOrigins("http://localhost:5173")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

app.UseAuthentication();
app.UseAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.MapControllers();

app.Run();



//测试用例
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
