using FluentAssertions;
using Hestia.Application.DTOs;
using Hestia.Application.Interfaces;
using Hestia.Application.UseCases;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Repositories;
using Moq;

namespace Hestia.Tests.Application;

public class RegisterUserTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly RegisterUser _sut;

    public RegisterUserTests()
    {
        _sut = new RegisterUser(_userRepo.Object, _hasher.Object);
    }

    [Fact]
    public async Task Should_register_new_user_successfully()
    {
        _userRepo.Setup(r => r.FindByEmailAsync("new@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        _hasher.Setup(h => h.Hash("Password123"))
            .Returns("hashed_password");
        _userRepo.Setup(r => r.SaveAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User u, CancellationToken _) => u);

        var request = new RegisterRequest
        {
            Email = "new@test.com",
            Password = "Password123",
            FullName = "New User",
            Phone = "+30999999999"
        };

        var result = await _sut.ExecuteAsync(request, CancellationToken.None);

        result.Should().NotBeNull();
        result.Email.Should().Be("new@test.com");
        result.FullName.Should().Be("New User");
        result.Role.Should().Be(UserRole.Member);
        result.IsVerified.Should().BeFalse();
    }

    [Fact]
    public async Task Should_throw_when_email_already_exists()
    {
        var existingUser = new User("existing@test.com", "hash", "Existing", "+30111111111");
        _userRepo.Setup(r => r.FindByEmailAsync("existing@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        var request = new RegisterRequest
        {
            Email = "existing@test.com",
            Password = "Password123",
            FullName = "Duplicate User",
            Phone = "+30222222222"
        };

        var act = () => _sut.ExecuteAsync(request, CancellationToken.None);

        await act.Should().ThrowAsync<ApplicationException>()
            .WithMessage("*already exists*");
    }
}
