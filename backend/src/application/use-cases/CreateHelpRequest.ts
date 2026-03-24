import { HelpRequest, HelpRequestType, HelpRequestPriority } from '../../domain/entities/HelpRequest';
import { IHelpRequestRepository } from '../../domain/repositories/IHelpRequestRepository';
import { IEmergencyRepository } from '../../domain/repositories/IEmergencyRepository';
import { IHelpOfferRepository } from '../../domain/repositories/IHelpOfferRepository';
import { MatchingService } from '../../domain/services/MatchingService';

export interface CreateHelpRequestDTO {
  emergencyId: string;
  requesterId: string;
  type: HelpRequestType;
  priority: HelpRequestPriority;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  numberOfPeople: number;
}

export class CreateHelpRequest {
  private matchingService: MatchingService;

  constructor(
    private readonly helpRequestRepository: IHelpRequestRepository,
    private readonly emergencyRepository: IEmergencyRepository,
    private readonly helpOfferRepository: IHelpOfferRepository
  ) {
    this.matchingService = new MatchingService();
  }

  async execute(dto: CreateHelpRequestDTO): Promise<{
    request: HelpRequest;
    suggestedMatches: Array<{ offerId: string; distanceKm: number; score: number }>;
  }> {
    // Verify emergency exists and is active
    const emergency = await this.emergencyRepository.findById(dto.emergencyId);
    if (!emergency) {
      throw new Error('Emergency not found');
    }
    if (!emergency.isActive()) {
      throw new Error('Emergency is no longer active');
    }

    // Create the request
    const request = new HelpRequest({
      emergencyId: dto.emergencyId,
      requesterId: dto.requesterId,
      type: dto.type,
      priority: dto.priority,
      title: dto.title,
      description: dto.description,
      latitude: dto.latitude,
      longitude: dto.longitude,
      numberOfPeople: dto.numberOfPeople,
    });

    const saved = await this.helpRequestRepository.save(request);

    // Find potential matches
    const availableOffers = await this.helpOfferRepository.findAvailableByType(
      dto.emergencyId,
      dto.type
    );

    const matches = this.matchingService.findBestMatches(saved, availableOffers, 5);

    return {
      request: saved,
      suggestedMatches: matches.map((m) => ({
        offerId: m.offer.id,
        distanceKm: Math.round(m.distanceKm * 10) / 10,
        score: Math.round(m.score),
      })),
    };
  }
}
