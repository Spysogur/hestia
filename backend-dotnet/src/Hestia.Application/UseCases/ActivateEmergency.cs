using Hestia.Application.DTOs;
using Hestia.Application.Interfaces;
using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;

namespace Hestia.Application.UseCases;

public class ActivateEmergency
{
    private readonly IEmergencyRepository _emergencyRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;

    public ActivateEmergency(
        IEmergencyRepository emergencyRepository,
        ICommunityRepository communityRepository,
        IUserRepository userRepository,
        INotificationService notificationService)
    {
        _emergencyRepository = emergencyRepository;
        _communityRepository = communityRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
    }

    public async Task<Emergency> ExecuteAsync(ActivateEmergencyRequest dto, Guid activatedBy, CancellationToken ct = default)
    {
        var community = await _communityRepository.FindByIdAsync(dto.CommunityId, ct)
            ?? throw new ApplicationException("Community not found");

        var activator = await _userRepository.FindByIdAsync(activatedBy, ct)
            ?? throw new ApplicationException("User not found");

        if (activator.CommunityId != dto.CommunityId)
            throw new ApplicationException("User is not a member of this community");

        var emergency = new Emergency(
            dto.CommunityId, dto.Type, dto.Severity,
            dto.Title, dto.Description,
            dto.Latitude, dto.Longitude, dto.RadiusKm,
            activatedBy);

        var saved = await _emergencyRepository.SaveAsync(emergency, ct);

        await _notificationService.NotifyCommunityAsync(
            dto.CommunityId,
            $"EMERGENCY ACTIVATED: {dto.Title} - {dto.Type} ({dto.Severity}). Open Hestia for details.",
            ct);

        var vulnerableUsers = await _userRepository.FindVulnerableInAreaAsync(
            dto.Latitude, dto.Longitude, dto.RadiusKm, ct);

        foreach (var user in vulnerableUsers)
        {
            await _notificationService.SendSmsAsync(
                user.Phone,
                $"HESTIA ALERT: {dto.Type} emergency in your area. {dto.Title}. Open app or call for help.",
                ct);
        }

        // Broadcast to SignalR clients
        await _notificationService.BroadcastEmergencyActivatedAsync(saved, ct);

        return saved;
    }
}
