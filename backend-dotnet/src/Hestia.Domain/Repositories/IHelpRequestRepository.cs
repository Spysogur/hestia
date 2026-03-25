using Hestia.Domain.Entities;
using Hestia.Domain.Enums;

namespace Hestia.Domain.Repositories;

public interface IHelpRequestRepository
{
    Task<HelpRequest?> FindByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<HelpRequest>> FindByEmergencyAsync(Guid emergencyId, CancellationToken ct = default);
    Task<IReadOnlyList<HelpRequest>> FindByRequesterAsync(Guid requesterId, CancellationToken ct = default);
    Task<IReadOnlyList<HelpRequest>> FindOpenByEmergencyAsync(Guid emergencyId, CancellationToken ct = default);
    Task<IReadOnlyList<HelpRequest>> FindByTypeAsync(Guid emergencyId, HelpType type, CancellationToken ct = default);
    Task<IReadOnlyList<HelpRequest>> FindByStatusAsync(Guid emergencyId, HelpRequestStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<HelpRequest>> FindUrgentAsync(Guid emergencyId, CancellationToken ct = default);
    Task<HelpRequest> SaveAsync(HelpRequest request, CancellationToken ct = default);
    Task<HelpRequest> UpdateAsync(HelpRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
