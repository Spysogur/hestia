import { HelpRequest } from '../entities/HelpRequest';
import { HelpOffer } from '../entities/HelpOffer';

export interface MatchResult {
  request: HelpRequest;
  offer: HelpOffer;
  distanceKm: number;
  score: number; // higher = better match
}

/**
 * Domain service for matching help requests with help offers.
 * Pure domain logic — no infrastructure dependencies.
 */
export class MatchingService {
  /**
   * Find the best available offers for a given request.
   * Scores based on: type match, distance, capacity, priority.
   */
  public findBestMatches(
    request: HelpRequest,
    offers: HelpOffer[],
    maxResults: number = 5
  ): MatchResult[] {
    const availableOffers = offers.filter(
      (o) => o.isAvailable() && o.type === request.type
    );

    const scored = availableOffers.map((offer) => {
      const distance = this.calculateDistance(
        request.latitude,
        request.longitude,
        offer.latitude,
        offer.longitude
      );

      const score = this.calculateScore(request, offer, distance);

      return { request, offer, distanceKm: distance, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * Auto-match all open requests with available offers for an emergency.
   */
  public autoMatch(
    requests: HelpRequest[],
    offers: HelpOffer[]
  ): MatchResult[] {
    const matches: MatchResult[] = [];
    const usedOfferIds = new Set<string>();
    const usedRequestIds = new Set<string>();

    // Sort requests by priority (urgent first)
    const sortedRequests = [...requests]
      .filter((r) => r.isOpen())
      .sort((a, b) => {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    for (const request of sortedRequests) {
      if (usedRequestIds.has(request.id)) continue;

      const availableOffers = offers.filter(
        (o) => o.isAvailable() && !usedOfferIds.has(o.id)
      );

      const bestMatches = this.findBestMatches(request, availableOffers, 1);

      if (bestMatches.length > 0) {
        const best = bestMatches[0];
        matches.push(best);
        usedOfferIds.add(best.offer.id);
        usedRequestIds.add(request.id);
      }
    }

    return matches;
  }

  private calculateScore(
    request: HelpRequest,
    offer: HelpOffer,
    distanceKm: number
  ): number {
    let score = 100;

    // Distance penalty (closer is better)
    score -= distanceKm * 2;

    // Capacity bonus
    if (offer.capacity >= request.numberOfPeople) {
      score += 20;
    }

    // Priority bonus (urgent requests get higher scoring matches)
    const priorityBonus: Record<string, number> = {
      URGENT: 30,
      HIGH: 20,
      MEDIUM: 10,
      LOW: 0,
    };
    score += priorityBonus[request.priority] ?? 0;

    return Math.max(0, score);
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
