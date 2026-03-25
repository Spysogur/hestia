using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Hestia.Infrastructure.Persistence.Repositories;

public class HelpOfferRepository : IHelpOfferRepository
{
    private readonly HestiaDbContext _db;

    public HelpOfferRepository(HestiaDbContext db) => _db = db;

    public Task<HelpOffer?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.HelpOffers.FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<HelpOffer>> FindByEmergencyAsync(Guid emergencyId, CancellationToken ct)
        => await _db.HelpOffers.Where(o => o.EmergencyId == emergencyId)
                                .OrderByDescending(o => o.CreatedAt)
                                .ToListAsync(ct);

    public async Task<IReadOnlyList<HelpOffer>> FindByVolunteerAsync(Guid volunteerId, CancellationToken ct)
        => await _db.HelpOffers.Where(o => o.VolunteerId == volunteerId).ToListAsync(ct);

    public async Task<IReadOnlyList<HelpOffer>> FindAvailableByEmergencyAsync(Guid emergencyId, CancellationToken ct)
        => await _db.HelpOffers
                    .Where(o => o.EmergencyId == emergencyId && o.Status == HelpOfferStatus.Available)
                    .ToListAsync(ct);

    public async Task<IReadOnlyList<HelpOffer>> FindAvailableByTypeAsync(Guid emergencyId, HelpType type, CancellationToken ct)
        => await _db.HelpOffers
                    .Where(o => o.EmergencyId == emergencyId && o.Type == type && o.Status == HelpOfferStatus.Available)
                    .ToListAsync(ct);

    public async Task<IReadOnlyList<HelpOffer>> FindByStatusAsync(Guid emergencyId, HelpOfferStatus status, CancellationToken ct)
        => await _db.HelpOffers.Where(o => o.EmergencyId == emergencyId && o.Status == status).ToListAsync(ct);

    public async Task<HelpOffer> SaveAsync(HelpOffer offer, CancellationToken ct)
    {
        _db.HelpOffers.Add(offer);
        await _db.SaveChangesAsync(ct);
        return offer;
    }

    public async Task<HelpOffer> UpdateAsync(HelpOffer offer, CancellationToken ct)
    {
        _db.HelpOffers.Update(offer);
        await _db.SaveChangesAsync(ct);
        return offer;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var o = await FindByIdAsync(id, ct);
        if (o is not null)
        {
            _db.HelpOffers.Remove(o);
            await _db.SaveChangesAsync(ct);
        }
    }
}
