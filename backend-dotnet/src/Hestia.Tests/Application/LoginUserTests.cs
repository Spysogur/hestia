using FluentAssertions;
using Hestia.Application.DTOs;
using Hestia.Application.Interfaces;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Repositories;
using Moq;

namespace Hestia.Tests.Application;

public class LoginUserTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IJwtService> _jwt = new();
    private readonly LoginUser _sut;

    public LoginUserTests()
    {
        _sut = new LoginUser(_userRepo.Object, _hasher.Object, _jwt.Object);
    }

    [Fact]
    public async Task Should_login_successfully_with_valid_credentials()
    {
        var user = new User("user@test.com", "hashed", "Test User", "+30111111111");
        _userRepo.Setup(r => r.FindByEmailAsync("user@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _hasher.Setup(h => h.Verify("Password123", "hashed")).Returns(true);
        _jwt.Setup(j => j.GenerateToken(user.Id, "user@test.com", "MEMBER")).Returns("jwt-token");

        var result = await _sut.ExecuteAsync(new LoginRequest { Email = "user@test.com", Password = "Password123" });

        result.Token.Should().Be("jwt-token");
        result.User.Email.Should().Be("user@test.com");
    }

    [Fact]
    public async Task Should_throw_when_user_not_found()
    {
        _userRepo.Setup(r => r.FindByEmailAsync("nobody@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var act = () => _sut.ExecuteAsync(new LoginRequest { Email = "nobody@test.com", Password = "x" });
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*Invalid*");
    }

    [Fact]
    public async Task Should_throw_when_password_is_wrong()
    {
        var user = new User("user@test.com", "hashed", "Test User", "+30111111111");
        _userRepo.Setup(r => r.FindByEmailAsync("user@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _hasher.Setup(h => h.Verify("wrong", "hashed")).Returns(false);

        var act = () => _sut.ExecuteAsync(new LoginRequest { Email = "user@test.com", Password = "wrong" });
        await act.Should().ThrowAsync<ApplicationException>().WithMessage("*Invalid*");
    }
}
