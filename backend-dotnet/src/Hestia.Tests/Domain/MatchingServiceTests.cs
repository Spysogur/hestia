using FluentAssertions;
using Hestia.Domain.Entities;
using Hestia.Domain.Enums;
using Hestia.Domain.Services;

namespace Hestia.Tests.Domain;

public class MatchingServiceTests
{
    private readonly MatchingService _sut = new();
    private readonly Guid _emergencyId = Guid.NewGuid();

    private HelpRequest MakeRequest(
        HelpType type = HelpType.Medical,
        HelpRequestPriority priority = HelpRequestPriority.Medium,
        double lat = 37.98, double lng = 23.73,
        int people = 1)
    {
        return new HelpRequest(_emergencyId, Guid.NewGuid(), type, priority,
            "Test request", "Description", lat, lng, people);
    }

    private HelpOffer MakeOffer(
        HelpType type = HelpType.Medical,
        double lat = 37.98, double lng = 23.73,
        int capacity = 1)
    {
        return new HelpOffer(_emergencyId, Guid.NewGuid(), type,
            "I can help", lat, lng, capacity);
    }

    [Fact]
    public void FindBestMatches_should_return_matching_type_offers()
    {
        var request = MakeRequest(HelpType.Medical);
        var offers = new[]
        {
            MakeOffer(HelpType.Medical),
            MakeOffer(HelpType.Transport),  // wrong type
            MakeOffer(HelpType.Medical),
        };

        var matches = _sut.FindBestMatches(request, offers.ToList());

        matches.Should().HaveCount(2);
        matches.Should().AllSatisfy(m => m.Offer.Type.Should().Be(HelpType.Medical));
    }

    [Fact]
    public void FindBestMatches_should_prefer_closer_offers()
    {
        var request = MakeRequest(lat: 37.98, lng: 23.73);
        var offers = new[]
        {
            MakeOffer(lat: 38.50, lng: 24.00),  // far
            MakeOffer(lat: 37.981, lng: 23.731), // very close
        };

        var matches = _sut.FindBestMatches(request, offers.ToList());

        matches.Should().HaveCountGreaterThan(0);
        matches.First().Offer.Should().Be(offers[1]); // closer one first
    }

    [Fact]
    public void FindBestMatches_should_prefer_sufficient_capacity()
    {
        var request = MakeRequest(people: 5);
        var offers = new[]
        {
            MakeOffer(capacity: 2),  // insufficient
            MakeOffer(capacity: 10), // sufficient
        };

        var matches = _sut.FindBestMatches(request, offers.ToList());

        matches.Should().HaveCount(2);
        // Offer with capacity >= people should score higher
        matches.First().Offer.Capacity.Should().BeGreaterOrEqualTo(5);
    }

    [Fact]
    public void AutoMatch_should_prioritize_urgent_requests()
    {
        var requests = new[]
        {
            MakeRequest(priority: HelpRequestPriority.Low),
            MakeRequest(priority: HelpRequestPriority.Urgent),
        };
        var offers = new[] { MakeOffer() }; // only 1 offer

        var matches = _sut.AutoMatch(requests.ToList(), offers.ToList());

        matches.Should().HaveCount(1);
        matches.First().Request.Priority.Should().Be(HelpRequestPriority.Urgent);
    }

    [Fact]
    public void AutoMatch_should_not_reuse_offers()
    {
        var requests = new[]
        {
            MakeRequest(priority: HelpRequestPriority.Urgent),
            MakeRequest(priority: HelpRequestPriority.High),
            MakeRequest(priority: HelpRequestPriority.Medium),
        };
        var offers = new[] { MakeOffer(), MakeOffer() }; // 2 offers for 3 requests

        var matches = _sut.AutoMatch(requests.ToList(), offers.ToList());

        matches.Should().HaveCount(2);
        var offerIds = matches.Select(m => m.Offer.Id).ToList();
        offerIds.Should().OnlyHaveUniqueItems();
    }

    [Fact]
    public void FindBestMatches_with_no_matching_offers_should_return_empty()
    {
        var request = MakeRequest(HelpType.Medical);
        var offers = new[] { MakeOffer(HelpType.Transport) };

        var matches = _sut.FindBestMatches(request, offers.ToList());

        matches.Should().BeEmpty();
    }
}
