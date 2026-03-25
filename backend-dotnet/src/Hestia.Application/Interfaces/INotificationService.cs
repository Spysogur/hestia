using Hestia.Domain.Entities;

namespace Hestia.Application.Interfaces;

public interface INotificationService
{
    Task NotifyCommunityAsync(Guid communityId, string message, CancellationToken ct = default);
    Task NotifyUserAsync(Guid userId, string message, CancellationToken ct = default);
    Task SendSmsAsync(string phone, string message, CancellationToken ct = default);

    /// <summary>Broadcast an emergency activation to the community group.</summary>
    Task BroadcastEmergencyActivatedAsync(Emergency emergency, CancellationToken ct = default);

    /// <summary>Broadcast a new help request to the community group.</summary>
    Task BroadcastHelpRequestCreatedAsync(HelpRequest request, CancellationToken ct = default);

    /// <summary>Broadcast a new help offer to the community group.</summary>
    Task BroadcastHelpOfferCreatedAsync(HelpOffer offer, CancellationToken ct = default);
}
