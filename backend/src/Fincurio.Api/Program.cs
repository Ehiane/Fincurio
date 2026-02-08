using Fincurio.Api.Middleware;
using Fincurio.Core.Interfaces.Repositories;
using Fincurio.Core.Interfaces.Services;
using Fincurio.Core.Services;
using Fincurio.Data.Context;
using Fincurio.Data.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Load .env file if it exists (local development secrets)
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddMemoryCache();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger Configuration
builder.Services.AddSwaggerGen();

// Database Configuration (MaxBatchSize=1 required for Supabase Supavisor pooler compatibility)
builder.Services.AddDbContext<FincurioDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.MaxBatchSize(1)));

// JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("FincurioFrontend", policy =>
    {
        var frontendUrl = builder.Configuration["Frontend:Url"] ?? "http://localhost:3000";
        // Include both www and non-www variants
        var wwwFrontendUrl = frontendUrl.Contains("://www.")
            ? frontendUrl.Replace("://www.", "://")
            : frontendUrl.Replace("://", "://www.");
        var allowedOrigins = new[] { "http://localhost:3000", "http://localhost:3001", frontendUrl, wwwFrontendUrl };

        policy.SetIsOriginAllowed(origin =>
            {
                // Allow explicitly configured origins
                if (allowedOrigins.Contains(origin)) return true;
                // Allow Vercel preview deployments
                if (origin.EndsWith(".vercel.app")) return true;
                return false;
            })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Dependency Injection - Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IMerchantRepository, MerchantRepository>();

// Dependency Injection - Services
builder.Services.AddHttpClient<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IInsightsService, InsightsService>();
builder.Services.AddScoped<IMerchantService, MerchantService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Exception handling middleware (must be first)
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors("FincurioFrontend");

// Authentication & Authorization (order matters!)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health endpoint that primes the database connection pool
app.MapGet("/health", async (FincurioDbContext db) =>
{
    try
    {
        await db.Database.ExecuteSqlRawAsync("SELECT 1");
        return Results.Ok(new { status = "healthy", db = "connected" });
    }
    catch
    {
        return Results.Ok(new { status = "healthy", db = "unavailable" });
    }
});

app.Run();
