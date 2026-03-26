using FluentAssertions;
using Hestia.Application.DTOs;
using Hestia.Application.Interfaces;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Moq;

namespace Hestia.Tests.Application;

public class ActivateEmergencyTests
{
    private readonly Mock<IEmergencyRepository> _emergencyRepo = new();
    private readonly Mock<ICommunityRepository> _communityRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<INotificationService> _notification = new();
    private readonly ActivateEmergency _sut;

    private readonly Guid _communityId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    public ActivateEmergencyTests()
    {
        _sut = new ActivateEmergency(_emergencyRepo.Object, _communityRepo.Object, _userRepo.Object, _notification.Object);
    }

    private ActivateEmergencyRequest MakeRequest() => new()
    {
        CommunityId = _communityId,
        Type = EmergencyType.Earthquake,
        Severity = EmergencySeverity.High,
        Title = "Test Emergency",
        Description = "Test description",
        Latitude = 37.98,
        Longitude = 23.73,
        RadiusKm = 5
    };

    [Fact]
    public async Task Should_activate_emergency_successfully()
    {
        var community = new Community("Test", "Desc", 37.98, 23.73, 5, "GR", "Attica");
        var user = new User("u@test.com", "h", "User", "+30111");
        user.JoinCommunity(_communityId);

        _communityRepo.Setup(r => r.FindByIdAsync(_communityId, It.IsAny<CancellationToken>())).ReturnsAsync(community);
        _userRepo.Setup(r => r.FindByIdAsync(_userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _emergencyRepo.Setup(r => r.SaveAsync(It.IsAny<Emergency>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Emergency e, CancellationToken _) => e);
        _userRepo.Setup(r => r.FindVulnerableInAreaAsync(It.IsAny<double>(), It.IsAny<double>(), It.IsAny<double>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User>());

        var result = await _sut.ExecuteAsync(MakeRequest(), _userId);

        result.Should().NotBeNull();
        result.Title.Should().Be("Test Emergency");
        result.Status.Should().Be(EmergencyStatus.Active);
        _notification.Verify(n => n.NotifyCommunityAsync(_communityId, It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Should_throw_when_community_not_found()
    {
        _communityRepo.Setup(r => r.FindByIdAsync(_communityId, It.IsAny<CancellationToken>())).ReturnsAsync((Community?)null);

        var act = () => _sut.ExecuteAsync(MakeRequest(), _userId);
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*Community not found*");
    }

    [Fact]
    public async Task Should_throw_when_user_not_found()
    {
        var community = new Community("Test", "Desc", 37.98, 23.73, 5, "GR", "Attica");
        _communityRepo.Setup(r => r.FindByIdAsync(_communityId, It.IsAny<CancellationToken>())).ReturnsAsync(community);
        _userRepo.Setup(r => r.FindByIdAsync(_userId, It.IsAny<CancellationToken>())).ReturnsAsync((User?)null);

        var act = () => _sut.ExecuteAsync(MakeRequest(), _userId);
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*User not found*");
    }

    [Fact]
    public async Task Should_throw_when_user_not_in_community()
    {
        var community = new Community("Test", "Desc", 37.98, 23.73, 5, "GR", "Attica");
        var user = new User("u@test.com", "h", "User", "+30111"); // no community

        _communityRepo.Setup(r => r.FindByIdAsync(_communityId, It.IsAny<CancellationToken>())).ReturnsAsync(community);
        _userRepo.Setup(r => r.FindByIdAsync(_userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var act = () => _sut.ExecuteAsync(MakeRequest(), _userId);
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*not a member*");
    }

    [Fact]
    public async Task Should_notify_vulnerable_users_via_sms()
    {
        var community = new Community("Test", "Desc", 37.98, 23.73, 5, "GR", "Attica");
        var user = new User("u@test.com", "h", "User", "+30111");
        user.JoinCommunity(_communityId);
        var vulnerable = new User("v@test.com", "h", "Vulnerable", "+30222");

        _communityRepo.Setup(r => r.FindByIdAsync(_communityId, It.IsAny<CancellationToken>())).ReturnsAsync(community);
        _userRepo.Setup(r => r.FindByIdAsync(_userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _emergencyRepo.Setup(r => r.SaveAsync(It.IsAny<Emergency>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Emergency e, CancellationToken _) => e);
        _userRepo.Setup(r => r.FindVulnerableInAreaAsync(It.IsAny<double>(), It.IsAny<double>(), It.IsAny<double>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User> { vulnerable });

        await _sut.ExecuteAsync(MakeRequest(), _userId);

        _notification.Verify(n => n.SendSmsAsync("+30222", It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
