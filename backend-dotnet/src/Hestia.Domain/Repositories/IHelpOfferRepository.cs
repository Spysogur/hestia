using Hestia.Domain.Entities;
using Hestia.Domain.Enums;

namespace Hestia.Domain.Repositories;

public interface IHelpOfferRepository
{
    Task<HelpOffer?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<HelpOffer>> FindByEmergencyAsync(Guid emergencyId, CancellationToken ct = default);
    Task<IReadOnlyList<HelpOffer>> FindByVolunteerAsync(Guid volunteerId, CancellationToken ct = default);
    Task<IReadOnlyList<HelpOffer>> FindAvailableByEmergencyAsync(Guid emergencyId, CancellationToken ct = default);
    Task<IReadOnlyList<HelpOffer>> FindAvailableByTypeAsync(Guid emergencyId, HelpType type, CancellationToken ct = default);
    Task<IReadOnlyList<HelpOffer>> FindByStatusAsync(Guid emergencyId, HelpOfferStatus status, CancellationToken ct = default);
    Task<HelpOffer> SaveAsync(HelpOffer offer, CancellationToken ct = default);
    Task<HelpOffer> UpdateAsync(HelpOffer offer, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
