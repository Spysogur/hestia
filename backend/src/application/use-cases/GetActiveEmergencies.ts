import { Emergency } from '../../domain/entities/Emergency';
import { IEmergencyRepository } from '../../domain/repositories/IEmergencyRepository';

export interface GetActiveEmergenciesDTO {
  communityId?: string;
}

export class GetActiveEmergencies {
  constructor(private readonly emergencyRepository: IEmergencyRepository) {}

  async execute(dto: GetActiveEmergenciesDTO = {}): Promise<Emergency[]> {
    if (dto.communityId) {
      return this.emergencyRepository.findActiveByCommunity(dto.communityId);
    }
    return this.emergencyRepository.findActive();
  }
}
