using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Hestia.API.Middleware;
using Hestia.Application.DTOs;
using Hestia.Infrastructure.Extensions;
using Hestia.Infrastructure.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── JSON serialization ────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opts.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// ── FluentValidation ──────────────────────────────────────────────
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// ── Infrastructure (EF Core, repos, auth, use cases) ──────────────
builder.Services.AddInfrastructure(builder.Configuration);

// ── SignalR ────────────────────────────────────────────────────────
builder.Services.AddSignalR();

// ── JWT Authentication ────────────────────────────────────────────
var jwtSecret = builder.Configuration["JwtSettings:Secret"]
                ?? "hestia-dev-secret-change-in-production-min-32-chars";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = "hestia-api",
        ValidateAudience = true,
        ValidAudience = "hestia-client",
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────
var corsOrigin = builder.Configuration["CorsSettings:AllowedOrigin"] ?? "*";
builder.Services.AddCors(opts =>
{
    opts.AddDefaultPolicy(policy =>
    {
        if (corsOrigin == "*")
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        else
            policy.WithOrigins(corsOrigin).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
    });
});

// ── Swagger / OpenAPI ─────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "🆘 Hestia API",
        Version = "v1",
        Description = """
            **Hestia — Community Emergency Response System**

            Named after the Greek goddess of the hearth and home.
            This API enables communities to self-organize before, during, and after emergencies.

            ## Authentication
            Most endpoints require a JWT Bearer token. Obtain one via `POST /api/v1/auth/login`.

            ## Real-time
            Connect to the SignalR hub at `/hubs/emergency` for live alerts.
            """,
        Contact = new OpenApiContact { Name = "Hestia Team", Email = "team@hestia.dev" }
    });

    // JWT Bearer auth in Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token (without 'Bearer ' prefix)"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    // Include XML comments for rich Swagger docs
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);

    // Tag descriptions for grouping
    c.TagActionsBy(api => [api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] ?? "Other"]);
});

// ══════════════════════════════════════════════════════════════════
var app = builder.Build();

// ── Middleware pipeline ───────────────────────────────────────────
app.UseMiddleware<ExceptionMiddleware>();

// Swagger always on (dev + prod)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hestia API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "Hestia API Documentation";
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── SignalR hub ───────────────────────────────────────────────────
app.MapHub<EmergencyHub>("/hubs/emergency");

// ── Health check ──────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "hestia-api",
    timestamp = DateTime.UtcNow.ToString("o")
})).WithTags("Health").WithDescription("Basic health check endpoint.");

// ── Start ─────────────────────────────────────────────────────────
var port = builder.Configuration["PORT"] ?? "5000";
app.Run($"http://0.0.0.0:{port}");
