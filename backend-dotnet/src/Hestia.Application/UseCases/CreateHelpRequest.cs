using Hestia.Application.DTOs;
using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;
using Hestia.Domain.Services;

namespace Hestia.Application.UseCases;

public class CreateHelpRequest
{
    private readonly IHelpRequestRepository _helpRequestRepository;
    private readonly IEmergencyRepository _emergencyRepository;
    private readonly IHelpOfferRepository _helpOfferRepository;
    private readonly MatchingService _matchingService;

    public CreateHelpRequest(
        IHelpRequestRepository helpRequestRepository,
        IEmergencyRepository emergencyRepository,
        IHelpOfferRepository helpOfferRepository,
        MatchingService matchingService)
    {
        _helpRequestRepository = helpRequestRepository;
        _emergencyRepository = emergencyRepository;
        _helpOfferRepository = helpOfferRepository;
        _matchingService = matchingService;
    }

    public async Task<CreateHelpRequestResponse> ExecuteAsync(
        CreateHelpRequestRequest dto,
        Guid requesterId,
        CancellationToken ct = default)
    {
        var emergency = await _emergencyRepository.FindByIdAsync(dto.EmergencyId, ct)
            ?? throw new ApplicationException("Emergency not found");

        if (!emergency.IsActive())
            throw new ApplicationException("Emergency is no longer active");

        var request = new HelpRequest(
            dto.EmergencyId, requesterId, dto.Type, dto.Priority,
            dto.Title, dto.Description,
            dto.Latitude, dto.Longitude, dto.NumberOfPeople);

        var saved = await _helpRequestRepository.SaveAsync(request, ct);

        var availableOffers = await _helpOfferRepository.FindAvailableByTypeAsync(dto.EmergencyId, dto.Type, ct);
        var matches = _matchingService.FindBestMatches(saved, availableOffers, 5);

        return new CreateHelpRequestResponse
        {
            Request = saved,
            SuggestedMatches = matches.Select(m => new SuggestedMatch
            {
                OfferId = m.Offer.Id,
                DistanceKm = Math.Round(m.DistanceKm, 1),
                Score = Math.Round(m.Score)
            }).ToList()
        };
    }
}
