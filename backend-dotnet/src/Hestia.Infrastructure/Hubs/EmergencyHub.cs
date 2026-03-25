using Microsoft.AspNetCore.SignalR;

namespace Hestia.Infrastructure.Hubs;

/// <summary>
/// SignalR hub replacing Socket.io.
/// Clients join community or user groups to receive real-time alerts.
/// </summary>
public class EmergencyHub : Hub
{
    /// <summary>Join the group for a specific community to receive its emergency alerts.</summary>
    public async Task JoinCommunity(string communityId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"community:{communityId}");

    /// <summary>Leave a community group.</summary>
    public async Task LeaveCommunity(string communityId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"community:{communityId}");

    /// <summary>Join a personal user group to receive direct notifications.</summary>
    public async Task JoinUserGroup(string userId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
}
