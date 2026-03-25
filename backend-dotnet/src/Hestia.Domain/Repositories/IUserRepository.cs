using Hestia.Domain.Entities;

namespace Hestia.Domain.Repositories;

public interface IUserRepository
{
    Task<User?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> FindByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<User>> FindByCommunityAsync(Guid communityId, CancellationToken ct = default);
    Task<IReadOnlyList<User>> FindVulnerableInAreaAsync(double lat, double lng, double radiusKm, CancellationToken ct = default);
    Task<IReadOnlyList<User>> FindWithResourceInAreaAsync(string resource, double lat, double lng, double radiusKm, CancellationToken ct = default);
    Task<User> SaveAsync(User user, CancellationToken ct = default);
    Task<User> UpdateAsync(User user, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
