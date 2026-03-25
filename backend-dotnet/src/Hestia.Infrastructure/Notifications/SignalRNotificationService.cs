using Hestia.Application.Interfaces;
using Hestia.Domain.Entities;
using Hestia.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Hestia.Infrastructure.Notifications;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<EmergencyHub> _hubContext;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        IHubContext<EmergencyHub> hubContext,
        ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyCommunityAsync(Guid communityId, string message, CancellationToken ct)
    {
        await _hubContext.Clients
            .Group($"community:{communityId}")
            .SendAsync("communityAlert", new { communityId, message, timestamp = DateTime.UtcNow }, ct);

        _logger.LogInformation("Notified community {CommunityId}: {Message}", communityId, message);
    }

    public async Task NotifyUserAsync(Guid userId, string message, CancellationToken ct)
    {
        await _hubContext.Clients
            .Group($"user:{userId}")
            .SendAsync("userAlert", new { userId, message, timestamp = DateTime.UtcNow }, ct);

        _logger.LogInformation("Notified user {UserId}: {Message}", userId, message);
    }

    public Task SendSmsAsync(string phone, string message, CancellationToken ct)
    {
        _logger.LogInformation("SMS to {Phone}: {Message}", phone, message);
        return Task.CompletedTask;
    }

    public async Task BroadcastEmergencyActivatedAsync(Emergency emergency, CancellationToken ct)
    {
        await _hubContext.Clients
            .Group($"community:{emergency.CommunityId}")
            .SendAsync("emergency:activated", emergency, ct);

        _logger.LogInformation("Broadcast emergency:activated {Id} to community {CommunityId}",
            emergency.Id, emergency.CommunityId);
    }

    public async Task BroadcastHelpRequestCreatedAsync(HelpRequest request, CancellationToken ct)
    {
        await _hubContext.Clients
            .Group($"community:{request.Emergency?.CommunityId}")
            .SendAsync("help:request:created", request, ct);

        _logger.LogInformation("Broadcast help:request:created {Id}", request.Id);
    }

    public async Task BroadcastHelpOfferCreatedAsync(HelpOffer offer, CancellationToken ct)
    {
        await _hubContext.Clients
            .Group($"community:{offer.Emergency?.CommunityId}")
            .SendAsync("help:offer:created", offer, ct);

        _logger.LogInformation("Broadcast help:offer:created {Id}", offer.Id);
    }
}
