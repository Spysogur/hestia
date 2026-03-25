using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Hestia.Infrastructure.Persistence.Repositories;

public class HelpRequestRepository : IHelpRequestRepository
{
    private readonly HestiaDbContext _db;

    public HelpRequestRepository(HestiaDbContext db) => _db = db;

    public Task<HelpRequest?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.HelpRequests.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IReadOnlyList<HelpRequest>> FindByEmergencyAsync(Guid emergencyId, CancellationToken ct)
        => await _db.HelpRequests.Where(r => r.EmergencyId == emergencyId)
                                  .OrderByDescending(r => r.CreatedAt)
                                  .ToListAsync(ct);

    public async Task<IReadOnlyList<HelpRequest>> FindByRequesterAsync(Guid requesterId, CancellationToken ct)
        => await _db.HelpRequests.Where(r => r.RequesterId == requesterId).ToListAsync(ct);

    public async Task<IReadOnlyList<HelpRequest>> FindOpenByEmergencyAsync(Guid emergencyId, CancellationToken ct)
        => await _db.HelpRequests
                    .Where(r => r.EmergencyId == emergencyId && r.Status == HelpRequestStatus.Open)
                    .ToListAsync(ct);

    public async Task<IReadOnlyList<HelpRequest>> FindByTypeAsync(Guid emergencyId, HelpType type, CancellationToken ct)
        => await _db.HelpRequests.Where(r => r.EmergencyId == emergencyId && r.Type == type).ToListAsync(ct);

    public async Task<IReadOnlyList<HelpRequest>> FindByStatusAsync(Guid emergencyId, HelpRequestStatus status, CancellationToken ct)
        => await _db.HelpRequests.Where(r => r.EmergencyId == emergencyId && r.Status == status).ToListAsync(ct);

    public async Task<IReadOnlyList<HelpRequest>> FindUrgentAsync(Guid emergencyId, CancellationToken ct)
        => await _db.HelpRequests
                    .Where(r => r.EmergencyId == emergencyId && r.Priority == HelpRequestPriority.Urgent)
                    .ToListAsync(ct);

    public async Task<HelpRequest> SaveAsync(HelpRequest request, CancellationToken ct)
    {
        _db.HelpRequests.Add(request);
        await _db.SaveChangesAsync(ct);
        return request;
    }

    public async Task<HelpRequest> UpdateAsync(HelpRequest request, CancellationToken ct)
    {
        _db.HelpRequests.Update(request);
        await _db.SaveChangesAsync(ct);
        return request;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var r = await FindByIdAsync(id, ct);
        if (r is not null)
        {
            _db.HelpRequests.Remove(r);
            await _db.SaveChangesAsync(ct);
        }
    }
}
