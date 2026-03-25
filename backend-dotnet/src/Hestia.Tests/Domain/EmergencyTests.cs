using FluentAssertions;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;

namespace Hestia.Tests.Domain;

public class EmergencyTests
{
    private Emergency CreateEmergency(EmergencySeverity severity = EmergencySeverity.Medium)
    {
        return new Emergency(
            communityId: Guid.NewGuid(),
            type: EmergencyType.Earthquake,
            severity: severity,
            title: "Test Emergency",
            description: "A test earthquake emergency",
            latitude: 37.9838,
            longitude: 23.7275,
            radiusKm: 10,
            activatedBy: Guid.NewGuid());
    }

    [Fact]
    public void New_emergency_should_be_active()
    {
        var emergency = CreateEmergency();
        emergency.IsActive().Should().BeTrue();
        emergency.Status.Should().Be(EmergencyStatus.Active);
    }

    [Fact]
    public void Resolve_should_set_status_and_resolvedBy()
    {
        var emergency = CreateEmergency();
        var resolverId = Guid.NewGuid();

        emergency.Resolve(resolverId);

        emergency.Status.Should().Be(EmergencyStatus.Resolved);
        emergency.ResolvedBy.Should().Be(resolverId);
        emergency.ResolvedAt.Should().NotBeNull();
        emergency.IsActive().Should().BeFalse();
    }

    [Fact]
    public void Escalate_should_increase_severity_one_level()
    {
        var emergency = CreateEmergency(EmergencySeverity.Low);

        emergency.Escalate();
        emergency.Severity.Should().Be(EmergencySeverity.Medium);

        emergency.Escalate();
        emergency.Severity.Should().Be(EmergencySeverity.High);

        emergency.Escalate();
        emergency.Severity.Should().Be(EmergencySeverity.Critical);
    }

    [Fact]
    public void Escalate_at_critical_should_stay_critical()
    {
        var emergency = CreateEmergency(EmergencySeverity.Critical);

        emergency.Escalate();

        emergency.Severity.Should().Be(EmergencySeverity.Critical);
    }

    [Fact]
    public void Cancel_should_set_status_and_resolvedBy()
    {
        var emergency = CreateEmergency();
        var cancellerId = Guid.NewGuid();

        emergency.Cancel(cancellerId);

        emergency.Status.Should().Be(EmergencyStatus.Cancelled);
        emergency.ResolvedBy.Should().Be(cancellerId);
    }

    [Fact]
    public void IsCritical_should_return_true_for_critical_severity()
    {
        var emergency = CreateEmergency(EmergencySeverity.Critical);
        emergency.IsCritical().Should().BeTrue();
    }

    [Fact]
    public void ExpandRadius_should_increase_radius()
    {
        var emergency = CreateEmergency();
        var original = emergency.RadiusKm;

        emergency.ExpandRadius(5);

        emergency.RadiusKm.Should().Be(original + 5);
    }
}
