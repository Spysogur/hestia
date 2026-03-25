using FluentAssertions;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;

namespace Hestia.Tests.Domain;

public class UserTests
{
    private User CreateUser()
    {
        return new User(
            email: "test@hestia.dev",
            passwordHash: "hashed",
            fullName: "Test User",
            phone: "+30123456789");
    }

    [Fact]
    public void New_user_should_have_member_role()
    {
        var user = CreateUser();
        user.Role.Should().Be(UserRole.Member);
    }

    [Fact]
    public void New_user_should_not_be_verified()
    {
        var user = CreateUser();
        user.IsVerified.Should().BeFalse();
    }

    [Fact]
    public void JoinCommunity_should_set_communityId()
    {
        var user = CreateUser();
        var communityId = Guid.NewGuid();

        user.JoinCommunity(communityId);

        user.CommunityId.Should().Be(communityId);
    }

    [Fact]
    public void UpdateLocation_should_set_lat_lng()
    {
        var user = CreateUser();

        user.UpdateLocation(37.98, 23.73);

        user.Latitude.Should().Be(37.98);
        user.Longitude.Should().Be(23.73);
    }

    [Fact]
    public void AddSkill_should_not_duplicate()
    {
        var user = CreateUser();

        user.AddSkill("first-aid");
        user.AddSkill("first-aid");

        user.Skills.Should().HaveCount(1);
    }

    [Fact]
    public void AddResource_should_not_duplicate()
    {
        var user = CreateUser();

        user.AddResource("truck");
        user.AddResource("truck");

        user.Resources.Should().HaveCount(1);
    }

    [Fact]
    public void IsVulnerable_should_return_true_when_vulnerabilities_exist()
    {
        var user = new User(
            "test@hestia.dev", "hashed", "Test", "+30123",
            vulnerabilities: [VulnerabilityType.Elderly]);

        user.IsVulnerable().Should().BeTrue();
    }

    [Fact]
    public void HasVehicle_should_return_false_when_NoVehicle_vulnerability()
    {
        var user = new User(
            "test@hestia.dev", "hashed", "Test", "+30123",
            vulnerabilities: [VulnerabilityType.NoVehicle]);

        user.HasVehicle().Should().BeFalse();
    }
}
