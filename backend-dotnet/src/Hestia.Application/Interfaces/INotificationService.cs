namespace Hestia.Application.Interfaces;

public interface INotificationService
{
    Task NotifyCommunityAsync(Guid communityId, string message, CancellationToken ct = default);
    Task NotifyUserAsync(Guid userId, string message, CancellationToken ct = default);
    Task SendSmsAsync(string phone, string message, CancellationToken ct = default);
}
