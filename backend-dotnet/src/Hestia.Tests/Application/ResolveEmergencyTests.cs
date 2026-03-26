using FluentAssertions;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Moq;

namespace Hestia.Tests.Application;

public class ResolveEmergencyTests
{
    private readonly Mock<IEmergencyRepository> _repo = new();
    private readonly ResolveEmergency _sut;

    public ResolveEmergencyTests() => _sut = new ResolveEmergency(_repo.Object);

    [Fact]
    public async Task Should_resolve_active_emergency()
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Flood, EmergencySeverity.High,
            "Flood", "Desc", 37.98, 23.73, 5, Guid.NewGuid());
        var resolverId = Guid.NewGuid();

        _repo.Setup(r => r.FindByIdAsync(emergency.Id, It.IsAny<CancellationToken>())).ReturnsAsync(emergency);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<Emergency>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Emergency e, CancellationToken _) => e);

        var result = await _sut.ExecuteAsync(emergency.Id, resolverId);

        result.Status.Should().Be(EmergencyStatus.Resolved);
        result.ResolvedBy.Should().Be(resolverId);
        result.ResolvedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task Should_throw_when_emergency_not_found()
    {
        _repo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Emergency?)null);

        var act = () => _sut.ExecuteAsync(Guid.NewGuid(), Guid.NewGuid());
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*not found*");
    }

    [Fact]
    public async Task Should_throw_when_already_resolved()
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Flood, EmergencySeverity.High,
            "Flood", "Desc", 37.98, 23.73, 5, Guid.NewGuid());
        emergency.Resolve(Guid.NewGuid()); // already resolved

        _repo.Setup(r => r.FindByIdAsync(emergency.Id, It.IsAny<CancellationToken>())).ReturnsAsync(emergency);

        var act = () => _sut.ExecuteAsync(emergency.Id, Guid.NewGuid());
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*not active*");
    }
}
