import { Community } from '../../domain/entities/Community';
import { ICommunityRepository } from '../../domain/repositories/ICommunityRepository';

export interface CreateCommunityDTO {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  country: string;
  region: string;
}

export class CreateCommunity {
  constructor(private readonly communityRepository: ICommunityRepository) {}

  async execute(dto: CreateCommunityDTO): Promise<Community> {
    const existing = await this.communityRepository.findByName(dto.name);
    if (existing) {
      throw new Error('A community with this name already exists');
    }

    const community = new Community({
      ...dto,
      isActive: true,
    });

    return this.communityRepository.save(community);
  }
}
