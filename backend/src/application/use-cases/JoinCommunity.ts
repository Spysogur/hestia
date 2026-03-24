import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ICommunityRepository } from '../../domain/repositories/ICommunityRepository';

export interface JoinCommunityDTO {
  userId: string;
  communityId: string;
}

export class JoinCommunity {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly communityRepository: ICommunityRepository
  ) {}

  async execute(dto: JoinCommunityDTO): Promise<User> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const community = await this.communityRepository.findById(dto.communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isActive) {
      throw new Error('Community is not active');
    }

    user.joinCommunity(dto.communityId);
    const updatedUser = await this.userRepository.update(user);

    community.incrementMemberCount();
    await this.communityRepository.update(community);

    return updatedUser;
  }
}
