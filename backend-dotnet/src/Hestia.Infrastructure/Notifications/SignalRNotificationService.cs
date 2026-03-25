using Hestia.Application.Interfaces;
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
        // SMS integration placeholder — wire up Twilio or similar here
        _logger.LogInformation("SMS to {Phone}: {Message}", phone, message);
        return Task.CompletedTask;
    }
}
