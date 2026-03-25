using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Hestia.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly HestiaDbContext _db;

    public UserRepository(HestiaDbContext db) => _db = db;

    public Task<User?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> FindByEmailAsync(string email, CancellationToken ct)
        => _db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task<IReadOnlyList<User>> FindByCommunityAsync(Guid communityId, CancellationToken ct)
        => await _db.Users.Where(u => u.CommunityId == communityId).ToListAsync(ct);

    public async Task<IReadOnlyList<User>> FindVulnerableInAreaAsync(double lat, double lng, double radiusKm, CancellationToken ct)
    {
        // Haversine approximation via bounding box + in-memory filter
        var all = await _db.Users
            .Where(u => u.Vulnerabilities != null && u.Vulnerabilities.Count > 0
                     && u.Latitude != null && u.Longitude != null)
            .ToListAsync(ct);

        return all.Where(u => Haversine(lat, lng, u.Latitude!.Value, u.Longitude!.Value) <= radiusKm)
                  .ToList();
    }

    public async Task<IReadOnlyList<User>> FindWithResourceInAreaAsync(string resource, double lat, double lng, double radiusKm, CancellationToken ct)
    {
        var all = await _db.Users
            .Where(u => u.Resources.Contains(resource) && u.Latitude != null && u.Longitude != null)
            .ToListAsync(ct);

        return all.Where(u => Haversine(lat, lng, u.Latitude!.Value, u.Longitude!.Value) <= radiusKm)
                  .ToList();
    }

    public async Task<User> SaveAsync(User user, CancellationToken ct)
    {
        user.Email = user.Email.ToLowerInvariant();
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
        return user;
    }

    public async Task<User> UpdateAsync(User user, CancellationToken ct)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync(ct);
        return user;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var user = await FindByIdAsync(id, ct);
        if (user is not null)
        {
            _db.Users.Remove(user);
            await _db.SaveChangesAsync(ct);
        }
    }

    private static double Haversine(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180)
              * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}
