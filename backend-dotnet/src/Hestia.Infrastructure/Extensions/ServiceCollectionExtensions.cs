using Hestia.Application.Interfaces;
using Hestia.Application.UseCases;
using Hestia.Domain.Enums;
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
using Hestia.Infrastructure.Persistence;

namespace Hestia.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── EF Core / PostgreSQL with native Postgres enum mappings ──
        var connectionString = configuration.GetConnectionString("DefaultConnection")!;
        services.AddDbContext<HestiaDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.MigrationsAssembly(typeof(HestiaDbContext).Assembly.FullName);
                npgsql.MapEnum<UserRole>("user_role");
                npgsql.MapEnum<VulnerabilityType>("vulnerability_type");
                npgsql.MapEnum<EmergencyType>("emergency_type");
                npgsql.MapEnum<EmergencySeverity>("emergency_severity");
                npgsql.MapEnum<EmergencyStatus>("emergency_status");
                npgsql.MapEnum<HelpType>("help_request_type");
                npgsql.MapEnum<HelpRequestPriority>("help_request_priority");
                npgsql.MapEnum<HelpRequestStatus>("help_request_status");
                npgsql.MapEnum<HelpOfferStatus>("help_offer_status");
                npgsql.MapEnum<MapPinType>("map_pin_type");
            }));

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
