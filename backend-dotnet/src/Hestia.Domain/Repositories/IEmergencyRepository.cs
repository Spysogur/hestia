using Hestia.Domain.Entities;
using Hestia.Domain.Enums;

namespace Hestia.Domain.Repositories;

public interface IEmergencyRepository
{
    Task<Emergency?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Emergency>> FindByCommunityAsync(Guid communityId, CancellationToken ct = default);
    Task<IReadOnlyList<Emergency>> FindActiveAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Emergency>> FindActiveByCommunityAsync(Guid communityId, CancellationToken ct = default);
    Task<IReadOnlyList<Emergency>> FindByStatusAsync(EmergencyStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<Emergency>> FindInAreaAsync(double lat, double lng, double radiusKm, CancellationToken ct = default);
    Task<Emergency> SaveAsync(Emergency emergency, CancellationToken ct = default);
    Task<Emergency> UpdateAsync(Emergency emergency, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
