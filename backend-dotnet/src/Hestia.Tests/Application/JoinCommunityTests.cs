using FluentAssertions;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;
using Moq;

namespace Hestia.Tests.Application;

public class JoinCommunityTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<ICommunityRepository> _communityRepo = new();
    private readonly JoinCommunity _sut;

    public JoinCommunityTests() => _sut = new JoinCommunity(_userRepo.Object, _communityRepo.Object);

    [Fact]
    public async Task Should_join_active_community()
    {
        var userId = Guid.NewGuid();
        var communityId = Guid.NewGuid();
        var user = new User("u@test.com", "h", "User", "+30111");
        var community = new Community("Test", "Desc", 37.98, 23.73, 5, "GR", "Attica");

        _userRepo.Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _communityRepo.Setup(r => r.FindByIdAsync(communityId, It.IsAny<CancellationToken>())).ReturnsAsync(community);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User u, CancellationToken _) => u);
        _communityRepo.Setup(r => r.UpdateAsync(It.IsAny<Community>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Community c, CancellationToken _) => c);

        var result = await _sut.ExecuteAsync(userId, communityId);

        result.CommunityId.Should().Be(communityId);
    }

    [Fact]
    public async Task Should_throw_when_user_not_found()
    {
        _userRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((User?)null);

        var act = () => _sut.ExecuteAsync(Guid.NewGuid(), Guid.NewGuid());
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*User not found*");
    }

    [Fact]
    public async Task Should_throw_when_community_not_found()
    {
        var user = new User("u@test.com", "h", "User", "+30111");
        _userRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _communityRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Community?)null);

        var act = () => _sut.ExecuteAsync(Guid.NewGuid(), Guid.NewGuid());
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*Community not found*");
    }

    [Fact]
    public async Task Should_throw_when_community_inactive()
    {
        var user = new User("u@test.com", "h", "User", "+30111");
        var community = new Community("Test", "Desc", 37.98, 23.73, 5, "GR", "Attica");
        community.Deactivate();

        _userRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _communityRepo.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(community);

        var act = () => _sut.ExecuteAsync(Guid.NewGuid(), Guid.NewGuid());
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*not active*");
    }
}
