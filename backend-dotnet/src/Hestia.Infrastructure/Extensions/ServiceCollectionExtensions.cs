using Hestia.Application.Interfaces;
using Hestia.Application.UseCases;
using Hestia.Domain.Repositories;
using Hestia.Domain.Services;
using Hestia.Infrastructure.Auth;
using Hestia.Infrastructure.Hubs;
using Hestia.Infrastructure.Notifications;
using Hestia.Infrastructure.Persistence;
using Hestia.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Hestia.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── EF Core / PostgreSQL ──────────────────────────────
        services.AddDbContext<HestiaDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(HestiaDbContext).Assembly.FullName)));

        // ── Repositories ──────────────────────────────────────
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICommunityRepository, CommunityRepository>();
        services.AddScoped<IEmergencyRepository, EmergencyRepository>();
        services.AddScoped<IHelpRequestRepository, HelpRequestRepository>();
        services.AddScoped<IHelpOfferRepository, HelpOfferRepository>();

        // ── Auth ──────────────────────────────────────────────
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<IJwtService, JwtService>();

        // ── Notifications ─────────────────────────────────────
        services.AddScoped<INotificationService, SignalRNotificationService>();

        // ── Domain services ───────────────────────────────────
        services.AddScoped<MatchingService>();

        // ── Use cases ─────────────────────────────────────────
        services.AddScoped<RegisterUser>();
        services.AddScoped<LoginUser>();
        services.AddScoped<CreateCommunity>();
        services.AddScoped<JoinCommunity>();
        services.AddScoped<ActivateEmergency>();
        services.AddScoped<ResolveEmergency>();
        services.AddScoped<EscalateEmergency>();
        services.AddScoped<CreateHelpRequest>();
        services.AddScoped<CreateHelpOffer>();

        return services;
    }
}
