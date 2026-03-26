using FluentAssertions;
using FluentValidation.TestHelper;
using Hestia.Application.DTOs;
using Hestia.Domain.Enums;

namespace Hestia.Tests.Application;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Should_pass_valid_request()
    {
        var result = _validator.TestValidate(new RegisterRequest
        {
            Email = "test@example.com", Password = "Password123!", FullName = "Test User", Phone = "+30111222333"
        });
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    public void Should_fail_invalid_email(string email)
    {
        var result = _validator.TestValidate(new RegisterRequest
        {
            Email = email, Password = "Password123!", FullName = "User", Phone = "+30111"
        });
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_fail_short_password()
    {
        var result = _validator.TestValidate(new RegisterRequest
        {
            Email = "a@b.com", Password = "short", FullName = "User", Phone = "+30111"
        });
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_fail_empty_full_name()
    {
        var result = _validator.TestValidate(new RegisterRequest
        {
            Email = "a@b.com", Password = "Password123!", FullName = "", Phone = "+30111"
        });
        result.ShouldHaveValidationErrorFor(x => x.FullName);
    }

    [Theory]
    [InlineData(-91)]
    [InlineData(91)]
    public void Should_fail_invalid_latitude(double lat)
    {
        var result = _validator.TestValidate(new RegisterRequest
        {
            Email = "a@b.com", Password = "Password123!", FullName = "User", Phone = "+30111", Latitude = lat
        });
        result.ShouldHaveValidationErrorFor(x => x.Latitude);
    }

    [Theory]
    [InlineData(-181)]
    [InlineData(181)]
    public void Should_fail_invalid_longitude(double lng)
    {
        var result = _validator.TestValidate(new RegisterRequest
        {
            Email = "a@b.com", Password = "Password123!", FullName = "User", Phone = "+30111", Longitude = lng
        });
        result.ShouldHaveValidationErrorFor(x => x.Longitude);
    }
}

public class LoginRequestValidatorTests
{
    private readonly LoginRequestValidator _validator = new();

    [Fact]
    public void Should_pass_valid_login()
    {
        var result = _validator.TestValidate(new LoginRequest { Email = "a@b.com", Password = "pass" });
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_fail_empty_email()
    {
        var result = _validator.TestValidate(new LoginRequest { Email = "", Password = "pass" });
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_fail_empty_password()
    {
        var result = _validator.TestValidate(new LoginRequest { Email = "a@b.com", Password = "" });
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}

public class CreateCommunityRequestValidatorTests
{
    private readonly CreateCommunityRequestValidator _validator = new();

    [Fact]
    public void Should_pass_valid_community()
    {
        var result = _validator.TestValidate(new CreateCommunityRequest
        {
            Name = "Athens", Description = "Community", Latitude = 37.98, Longitude = 23.73,
            RadiusKm = 5, Country = "GR", Region = "Attica"
        });
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_fail_zero_radius()
    {
        var result = _validator.TestValidate(new CreateCommunityRequest
        {
            Name = "X", Description = "D", Latitude = 0, Longitude = 0,
            RadiusKm = 0, Country = "GR", Region = "R"
        });
        result.ShouldHaveValidationErrorFor(x => x.RadiusKm);
    }

    [Fact]
    public void Should_fail_radius_over_500()
    {
        var result = _validator.TestValidate(new CreateCommunityRequest
        {
            Name = "X", Description = "D", Latitude = 0, Longitude = 0,
            RadiusKm = 501, Country = "GR", Region = "R"
        });
        result.ShouldHaveValidationErrorFor(x => x.RadiusKm);
    }
}

public class ActivateEmergencyRequestValidatorTests
{
    private readonly ActivateEmergencyRequestValidator _validator = new();

    [Fact]
    public void Should_pass_valid_emergency()
    {
        var result = _validator.TestValidate(new ActivateEmergencyRequest
        {
            CommunityId = Guid.NewGuid(), Title = "Fire", Description = "Big fire",
            Latitude = 37.98, Longitude = 23.73, RadiusKm = 10
        });
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_fail_empty_community_id()
    {
        var result = _validator.TestValidate(new ActivateEmergencyRequest
        {
            CommunityId = Guid.Empty, Title = "Fire", Description = "Big fire",
            Latitude = 37.98, Longitude = 23.73, RadiusKm = 10
        });
        result.ShouldHaveValidationErrorFor(x => x.CommunityId);
    }
}

public class CreateHelpRequestValidatorTests
{
    private readonly CreateHelpRequestRequestValidator _validator = new();

    [Fact]
    public void Should_fail_zero_people()
    {
        var result = _validator.TestValidate(new CreateHelpRequestRequest
        {
            EmergencyId = Guid.NewGuid(), Title = "Help", Description = "Need help",
            Latitude = 0, Longitude = 0, NumberOfPeople = 0
        });
        result.ShouldHaveValidationErrorFor(x => x.NumberOfPeople);
    }

    [Fact]
    public void Should_fail_over_1000_people()
    {
        var result = _validator.TestValidate(new CreateHelpRequestRequest
        {
            EmergencyId = Guid.NewGuid(), Title = "Help", Description = "Need help",
            Latitude = 0, Longitude = 0, NumberOfPeople = 1001
        });
        result.ShouldHaveValidationErrorFor(x => x.NumberOfPeople);
    }
}

public class CreateHelpOfferValidatorTests
{
    private readonly CreateHelpOfferRequestValidator _validator = new();

    [Fact]
    public void Should_pass_without_capacity()
    {
        var result = _validator.TestValidate(new CreateHelpOfferRequest
        {
            EmergencyId = Guid.NewGuid(), Description = "Can help", Latitude = 0, Longitude = 0
        });
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_fail_zero_capacity()
    {
        var result = _validator.TestValidate(new CreateHelpOfferRequest
        {
            EmergencyId = Guid.NewGuid(), Description = "Can help", Latitude = 0, Longitude = 0, Capacity = 0
        });
        result.ShouldHaveValidationErrorFor(x => x.Capacity);
    }
}
