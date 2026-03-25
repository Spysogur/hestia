using Hestia.Domain.Entities;

namespace Hestia.Domain.Repositories;

public interface ICommunityRepository
{
    Task<Community?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<Community?> FindByNameAsync(string name, CancellationToken ct = default);
    Task<IReadOnlyList<Community>> FindNearbyAsync(double lat, double lng, double radiusKm, CancellationToken ct = default);
    Task<IReadOnlyList<Community>> FindByCountryAsync(string country, CancellationToken ct = default);
    Task<IReadOnlyList<Community>> FindAllAsync(CancellationToken ct = default);
    Task<Community> SaveAsync(Community community, CancellationToken ct = default);
    Task<Community> UpdateAsync(Community community, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
