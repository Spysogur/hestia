using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Hestia.Infrastructure.Persistence.Repositories;

public class CommunityRepository : ICommunityRepository
{
    private readonly HestiaDbContext _db;

    public CommunityRepository(HestiaDbContext db) => _db = db;

    public Task<Community?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Communities.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<Community?> FindByNameAsync(string name, CancellationToken ct)
        => _db.Communities.FirstOrDefaultAsync(c => c.Name == name, ct);

    public async Task<IReadOnlyList<Community>> FindNearbyAsync(double lat, double lng, double radiusKm, CancellationToken ct)
    {
        var all = await _db.Communities.Where(c => c.IsActive).ToListAsync(ct);
        return all.Where(c => Haversine(lat, lng, c.Latitude, c.Longitude) <= radiusKm).ToList();
    }

    public async Task<IReadOnlyList<Community>> FindByCountryAsync(string country, CancellationToken ct)
        => await _db.Communities.Where(c => c.Country == country).ToListAsync(ct);

    public async Task<IReadOnlyList<Community>> FindAllAsync(CancellationToken ct)
        => await _db.Communities.ToListAsync(ct);

    public async Task<Community> SaveAsync(Community community, CancellationToken ct)
    {
        _db.Communities.Add(community);
        await _db.SaveChangesAsync(ct);
        return community;
    }

    public async Task<Community> UpdateAsync(Community community, CancellationToken ct)
    {
        _db.Communities.Update(community);
        await _db.SaveChangesAsync(ct);
        return community;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var community = await FindByIdAsync(id, ct);
        if (community is not null)
        {
            _db.Communities.Remove(community);
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
