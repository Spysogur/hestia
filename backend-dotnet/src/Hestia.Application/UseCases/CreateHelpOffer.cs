using Hestia.Application.DTOs;
using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;

namespace Hestia.Application.UseCases;

public class CreateHelpOffer
{
    private readonly IHelpOfferRepository _helpOfferRepository;
    private readonly IEmergencyRepository _emergencyRepository;

    public CreateHelpOffer(IHelpOfferRepository helpOfferRepository, IEmergencyRepository emergencyRepository)
    {
        _helpOfferRepository = helpOfferRepository;
        _emergencyRepository = emergencyRepository;
    }

    public async Task<HelpOffer> ExecuteAsync(CreateHelpOfferRequest dto, Guid volunteerId, CancellationToken ct = default)
    {
        var emergency = await _emergencyRepository.FindByIdAsync(dto.EmergencyId, ct)
            ?? throw new ApplicationException("Emergency not found");

        if (!emergency.IsActive())
            throw new ApplicationException("Emergency is no longer active");

        var offer = new HelpOffer(
            dto.EmergencyId, volunteerId, dto.Type,
            dto.Description, dto.Latitude, dto.Longitude,
            dto.Capacity ?? 1);

        return await _helpOfferRepository.SaveAsync(offer, ct);
    }
}
