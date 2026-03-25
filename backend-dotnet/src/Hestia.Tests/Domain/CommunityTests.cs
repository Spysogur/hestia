using FluentAssertions;
using Hestia.Domain.Entities;

namespace Hestia.Tests.Domain;

public class CommunityTests
{
    private Community CreateCommunity()
    {
        return new Community(
            name: "Athens Rescue",
            description: "Emergency response team for Athens",
            latitude: 37.9838,
            longitude: 23.7275,
            radiusKm: 25,
            country: "GR",
            region: "Attica");
    }

    [Fact]
    public void New_community_should_be_active_with_zero_members()
    {
        var community = CreateCommunity();

        community.IsActive.Should().BeTrue();
        community.MemberCount.Should().Be(0);
    }

    [Fact]
    public void IncrementMemberCount_should_increase_by_one()
    {
        var community = CreateCommunity();

        community.IncrementMemberCount();
        community.IncrementMemberCount();

        community.MemberCount.Should().Be(2);
    }

    [Fact]
    public void DecrementMemberCount_should_not_go_below_zero()
    {
        var community = CreateCommunity();

        community.DecrementMemberCount();

        community.MemberCount.Should().Be(0);
    }

    [Fact]
    public void Deactivate_should_set_isActive_false()
    {
        var community = CreateCommunity();

        community.Deactivate();

        community.IsActive.Should().BeFalse();
    }

    [Fact]
    public void Activate_should_set_isActive_true()
    {
        var community = CreateCommunity();
        community.Deactivate();

        community.Activate();

        community.IsActive.Should().BeTrue();
    }
}
