using FluentAssertions;
using Hestia.Application.DTOs;
using Hestia.Application.Interfaces;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Hestia.Domain.Services;
using Moq;

namespace Hestia.Tests.Application;

public class CreateHelpRequestTests
{
    private readonly Mock<IHelpRequestRepository> _requestRepo = new();
    private readonly Mock<IEmergencyRepository> _emergencyRepo = new();
    private readonly Mock<IHelpOfferRepository> _offerRepo = new();
    private readonly Mock<INotificationService> _notification = new();
    private readonly CreateHelpRequest _sut;

    public CreateHelpRequestTests()
    {
        _sut = new CreateHelpRequest(
            _requestRepo.Object, _emergencyRepo.Object, _offerRepo.Object,
            new MatchingService(), _notification.Object);
    }

    [Fact]
    public async Task Should_create_help_request_for_active_emergency()
    {
        var emergencyId = Guid.NewGuid();
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Flood, EmergencySeverity.High,
            "Flood", "Desc", 37.98, 23.73, 5, Guid.NewGuid());

        _emergencyRepo.Setup(r => r.FindByIdAsync(emergencyId, It.IsAny<CancellationToken>())).ReturnsAsync(emergency);
        _requestRepo.Setup(r => r.SaveAsync(It.IsAny<HelpRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((HelpRequest hr, CancellationToken _) => hr);
        _offerRepo.Setup(r => r.FindAvailableByTypeAsync(emergencyId, HelpType.Medical, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<HelpOffer>());

        var result = await _sut.ExecuteAsync(new CreateHelpRequestRequest
        {
            EmergencyId = emergencyId, Type = HelpType.Medical, Priority = HelpRequestPriority.High,
            Title = "Need medic", Description = "Injured person",
            Latitude = 37.98, Longitude = 23.73, NumberOfPeople = 2
        }, Guid.NewGuid());

        result.Should().NotBeNull();
        result.SuggestedMatches.Should().BeEmpty();
    }

    [Fact]
    public async Task Should_throw_when_emergency_not_found()
    {
        _emergencyRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Emergency?)null);

        var act = () => _sut.ExecuteAsync(new CreateHelpRequestRequest
        {
            EmergencyId = Guid.NewGuid(), Type = HelpType.Medical, Priority = HelpRequestPriority.High,
            Title = "Help", Description = "Desc", Latitude = 0, Longitude = 0, NumberOfPeople = 1
        }, Guid.NewGuid());

        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*not found*");
    }

    [Fact]
    public async Task Should_throw_when_emergency_not_active()
    {
        var emergency = new Emergency(Guid.NewGuid(), EmergencyType.Flood, EmergencySeverity.High,
            "Flood", "Desc", 37.98, 23.73, 5, Guid.NewGuid());
        emergency.Resolve(Guid.NewGuid());

        _emergencyRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(emergency);

        var act = () => _sut.ExecuteAsync(new CreateHelpRequestRequest
        {
            EmergencyId = emergency.Id, Type = HelpType.Shelter, Priority = HelpRequestPriority.Low,
            Title = "Help", Description = "Desc", Latitude = 0, Longitude = 0, NumberOfPeople = 1
        }, Guid.NewGuid());

        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*no longer active*");
    }
}
