using FluentAssertions;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Moq;

namespace Hestia.Tests.Application;

public class EscalateEmergencyTests
{
    private readonly Mock<IEmergencyRepository> _repo = new();
    private readonly EscalateEmergency _sut;

    public EscalateEmergencyTests() => _sut = new EscalateEmergency(_repo.Object);

    [Theory]
    [InlineData(EmergencySeverity.Low, EmergencySeverity.Medium)]
    [InlineData(EmergencySeverity.Medium, EmergencySeverity.High)]
    [InlineData(EmergencySeverity.High, EmergencySeverity.Critical)]
    public async Task Should_escalate_severity_one_level(EmergencySeverity from, EmergencySeverity to)
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Storm, from,
            "Storm", "Desc", 37.98, 23.73, 5, Guid.NewGuid());

        _repo.Setup(r => r.FindByIdAsync(emergency.Id, It.IsAny<CancellationToken>())).ReturnsAsync(emergency);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<Emergency>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Emergency e, CancellationToken _) => e);

        var result = await _sut.ExecuteAsync(emergency.Id);

        result.Severity.Should().Be(to);
    }

    [Fact]
    public async Task Should_not_escalate_beyond_critical()
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Storm, EmergencySeverity.Critical,
            "Storm", "Desc", 37.98, 23.73, 5, Guid.NewGuid());

        _repo.Setup(r => r.FindByIdAsync(emergency.Id, It.IsAny<CancellationToken>())).ReturnsAsync(emergency);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<Emergency>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Emergency e, CancellationToken _) => e);

        var result = await _sut.ExecuteAsync(emergency.Id);
        result.Severity.Should().Be(EmergencySeverity.Critical);
    }

    [Fact]
    public async Task Should_throw_when_not_active()
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Storm, EmergencySeverity.Low,
            "Storm", "Desc", 37.98, 23.73, 5, Guid.NewGuid());
        emergency.Resolve(Guid.NewGuid());

        _repo.Setup(r => r.FindByIdAsync(emergency.Id, It.IsAny<CancellationToken>())).ReturnsAsync(emergency);

        var act = () => _sut.ExecuteAsync(emergency.Id);
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*not active*");
    }
}
