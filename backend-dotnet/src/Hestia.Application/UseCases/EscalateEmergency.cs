using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;

namespace Hestia.Application.UseCases;

public class EscalateEmergency
{
    private readonly IEmergencyRepository _emergencyRepository;

    public EscalateEmergency(IEmergencyRepository emergencyRepository)
        => _emergencyRepository = emergencyRepository;

    public async Task<Emergency> ExecuteAsync(Guid emergencyId, CancellationToken ct = default)
    {
        var emergency = await _emergencyRepository.FindByIdAsync(emergencyId, ct)
            ?? throw new ApplicationException("Emergency not found");

        if (!emergency.IsActive())
            throw new ApplicationException("Emergency is not active");

        emergency.Escalate();
        return await _emergencyRepository.UpdateAsync(emergency, ct);
    }
}
