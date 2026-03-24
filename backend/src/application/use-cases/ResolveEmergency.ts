import { Emergency } from '../../domain/entities/Emergency';
import { IEmergencyRepository } from '../../domain/repositories/IEmergencyRepository';

export interface ResolveEmergencyDTO {
  emergencyId: string;
  resolvedBy: string;
}

export class ResolveEmergency {
  constructor(private readonly emergencyRepository: IEmergencyRepository) {}

  async execute(dto: ResolveEmergencyDTO): Promise<Emergency> {
    const emergency = await this.emergencyRepository.findById(dto.emergencyId);
    if (!emergency) {
      throw new Error('Emergency not found');
    }

    if (!emergency.isActive()) {
      throw new Error('Emergency is not active');
    }

    emergency.resolve(dto.resolvedBy);
    return this.emergencyRepository.update(emergency);
  }
}
