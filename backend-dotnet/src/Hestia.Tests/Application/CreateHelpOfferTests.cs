using FluentAssertions;
using Hestia.Application.DTOs;
using Hestia.Application.Interfaces;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Moq;

namespace Hestia.Tests.Application;

public class CreateHelpOfferTests
{
    private readonly Mock<IHelpOfferRepository> _offerRepo = new();
    private readonly Mock<IEmergencyRepository> _emergencyRepo = new();
    private readonly Mock<INotificationService> _notification = new();
    private readonly CreateHelpOffer _sut;

    public CreateHelpOfferTests()
    {
        _sut = new CreateHelpOffer(_offerRepo.Object, _emergencyRepo.Object, _notification.Object);
    }

    [Fact]
    public async Task Should_create_offer_for_active_emergency()
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Flood, EmergencySeverity.High,
            "Flood", "Desc", 37.98, 23.73, 5, Guid.NewGuid());

        _emergencyRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(emergency);
        _offerRepo.Setup(r => r.SaveAsync(It.IsAny<HelpOffer>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((HelpOffer o, CancellationToken _) => o);

        var result = await _sut.ExecuteAsync(new CreateHelpOfferRequest
        {
            EmergencyId = emergency.Id, Type = HelpType.Transport,
            Description = "Can drive 4 people", Latitude = 37.99, Longitude = 23.74, Capacity = 4
        }, Guid.NewGuid());

        result.Should().NotBeNull();
        result.Capacity.Should().Be(4);
    }

    [Fact]
    public async Task Should_default_capacity_to_one()
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Flood, EmergencySeverity.High,
            "Flood", "Desc", 37.98, 23.73, 5, Guid.NewGuid());

        _emergencyRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(emergency);
        _offerRepo.Setup(r => r.SaveAsync(It.IsAny<HelpOffer>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((HelpOffer o, CancellationToken _) => o);

        var result = await _sut.ExecuteAsync(new CreateHelpOfferRequest
        {
            EmergencyId = emergency.Id, Type = HelpType.Medical,
            Description = "Paramedic", Latitude = 37.99, Longitude = 23.74
        }, Guid.NewGuid());

        result.Capacity.Should().Be(1);
    }

    [Fact]
    public async Task Should_throw_when_emergency_not_active()
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Flood, EmergencySeverity.High,
            "Flood", "Desc", 37.98, 23.73, 5, Guid.NewGuid());
        emergency.Resolve(Guid.NewGuid());

        _emergencyRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(emergency);

        var act = () => _sut.ExecuteAsync(new CreateHelpOfferRequest
        {
            EmergencyId = emergency.Id, Type = HelpType.Shelter,
            Description = "Offer", Latitude = 0, Longitude = 0
        }, Guid.NewGuid());

        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*no longer active*");
    }
}
