import { HelpOffer } from '../../domain/entities/HelpOffer';
import { HelpRequestType } from '../../domain/entities/HelpRequest';
import { IHelpOfferRepository } from '../../domain/repositories/IHelpOfferRepository';
import { IEmergencyRepository } from '../../domain/repositories/IEmergencyRepository';

export interface CreateHelpOfferDTO {
  emergencyId: string;
  volunteerId: string;
  type: HelpRequestType;
  description: string;
  latitude: number;
  longitude: number;
  capacity?: number;
}

export class CreateHelpOffer {
  constructor(
    private readonly helpOfferRepository: IHelpOfferRepository,
    private readonly emergencyRepository: IEmergencyRepository
  ) {}

  async execute(dto: CreateHelpOfferDTO): Promise<HelpOffer> {
    const emergency = await this.emergencyRepository.findById(dto.emergencyId);
    if (!emergency) {
      throw new Error('Emergency not found');
    }
    if (!emergency.isActive()) {
      throw new Error('Emergency is no longer active');
    }

    const offer = new HelpOffer({
      emergencyId: dto.emergencyId,
      volunteerId: dto.volunteerId,
      type: dto.type,
      description: dto.description,
      latitude: dto.latitude,
      longitude: dto.longitude,
      capacity: dto.capacity,
    });

    return this.helpOfferRepository.save(offer);
  }
}
