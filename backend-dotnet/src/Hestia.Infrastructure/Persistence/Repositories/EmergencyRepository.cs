using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Hestia.Infrastructure.Persistence.Repositories;

public class EmergencyRepository : IEmergencyRepository
{
    private readonly HestiaDbContext _db;

    public EmergencyRepository(HestiaDbContext db) => _db = db;

    public Task<Emergency?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Emergencies.Include(e => e.Community).FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<IReadOnlyList<Emergency>> FindByCommunityAsync(Guid communityId, CancellationToken ct)
        => await _db.Emergencies.Where(e => e.CommunityId == communityId)
                                .OrderByDescending(e => e.CreatedAt)
                                .ToListAsync(ct);

    public async Task<IReadOnlyList<Emergency>> FindActiveAsync(CancellationToken ct)
        => await _db.Emergencies.Where(e => e.Status == EmergencyStatus.Active)
                                .OrderByDescending(e => e.CreatedAt)
                                .ToListAsync(ct);

    public async Task<IReadOnlyList<Emergency>> FindActiveByCommunityAsync(Guid communityId, CancellationToken ct)
        => await _db.Emergencies
                    .Where(e => e.CommunityId == communityId && e.Status == EmergencyStatus.Active)
                    .OrderByDescending(e => e.CreatedAt)
                    .ToListAsync(ct);

    public async Task<IReadOnlyList<Emergency>> FindByStatusAsync(EmergencyStatus status, CancellationToken ct)
        => await _db.Emergencies.Where(e => e.Status == status).ToListAsync(ct);

    public async Task<IReadOnlyList<Emergency>> FindInAreaAsync(double lat, double lng, double radiusKm, CancellationToken ct)
    {
        var all = await _db.Emergencies.ToListAsync(ct);
        return all.Where(e => Haversine(lat, lng, e.Latitude, e.Longitude) <= radiusKm).ToList();
    }

    public async Task<Emergency> SaveAsync(Emergency emergency, CancellationToken ct)
    {
        _db.Emergencies.Add(emergency);
        await _db.SaveChangesAsync(ct);
        return emergency;
    }

    public async Task<Emergency> UpdateAsync(Emergency emergency, CancellationToken ct)
    {
        _db.Emergencies.Update(emergency);
        await _db.SaveChangesAsync(ct);
        return emergency;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var e = await FindByIdAsync(id, ct);
        if (e is not null)
        {
            _db.Emergencies.Remove(e);
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
