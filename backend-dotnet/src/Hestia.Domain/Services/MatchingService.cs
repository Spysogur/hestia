using Hestia.Domain.Entities;
using Hestia.Domain.Enums;

namespace Hestia.Domain.Services;

/// <summary>
/// Domain service for matching help requests with help offers.
/// Pure domain logic — no infrastructure dependencies.
/// </summary>
public class MatchingService
{
    /// <summary>
    /// Find the best available offers for a given request.
    /// Scores based on: type match, distance, capacity, priority.
    /// </summary>
    public IReadOnlyList<MatchResult> FindBestMatches(
        HelpRequest request,
        IEnumerable<HelpOffer> offers,
        int maxResults = 5)
    {
        var availableOffers = offers
            .Where(o => o.IsAvailable() && o.Type == request.Type)
            .ToList();

        var scored = availableOffers.Select(offer =>
        {
            var distance = CalculateDistance(
                request.Latitude, request.Longitude,
                offer.Latitude, offer.Longitude);
            var score = CalculateScore(request, offer, distance);
            return new MatchResult(request, offer, distance, score);
        });

        return scored
            .OrderByDescending(r => r.Score)
            .Take(maxResults)
            .ToList();
    }

    /// <summary>
    /// Auto-match all open requests with available offers for an emergency.
    /// Prioritises urgent requests first.
    /// </summary>
    public IReadOnlyList<MatchResult> AutoMatch(
        IEnumerable<HelpRequest> requests,
        IEnumerable<HelpOffer> offers)
    {
        var results = new List<MatchResult>();
        var usedOfferIds = new HashSet<Guid>();
        var usedRequestIds = new HashSet<Guid>();
        var offersList = offers.ToList();

        var priorityOrder = new Dictionary<HelpRequestPriority, int>
        {
            [HelpRequestPriority.Urgent] = 0,
            [HelpRequestPriority.High] = 1,
            [HelpRequestPriority.Medium] = 2,
            [HelpRequestPriority.Low] = 3,
        };

        var sortedRequests = requests
            .Where(r => r.IsOpen())
            .OrderBy(r => priorityOrder[r.Priority])
            .ToList();

        foreach (var request in sortedRequests)
        {
            if (usedRequestIds.Contains(request.Id)) continue;

            var available = offersList.Where(o => o.IsAvailable() && !usedOfferIds.Contains(o.Id));
            var best = FindBestMatches(request, available, 1);

            if (best.Count > 0)
            {
                results.Add(best[0]);
                usedOfferIds.Add(best[0].Offer.Id);
                usedRequestIds.Add(request.Id);
            }
        }

        return results;
    }

    private static double CalculateScore(HelpRequest request, HelpOffer offer, double distanceKm)
    {
        var score = 100.0;

        // Distance penalty (closer is better)
        score -= distanceKm * 2;

        // Capacity bonus
        if (offer.Capacity >= request.NumberOfPeople)
            score += 20;

        // Priority bonus
        score += request.Priority switch
        {
            HelpRequestPriority.Urgent => 30,
            HelpRequestPriority.High => 20,
            HelpRequestPriority.Medium => 10,
            _ => 0
        };

        return Math.Max(0, score);
    }

    private static double CalculateDistance(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(lat1 * Math.PI / 180)
              * Math.Cos(lat2 * Math.PI / 180)
              * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }
}

/// <summary>Represents a scored match between a request and an offer.</summary>
public record MatchResult(HelpRequest Request, HelpOffer Offer, double DistanceKm, double Score);
