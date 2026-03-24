import { Emergency, EmergencyType, EmergencySeverity } from '../../domain/entities/Emergency';
import { IEmergencyRepository } from '../../domain/repositories/IEmergencyRepository';
import { ICommunityRepository } from '../../domain/repositories/ICommunityRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface ActivateEmergencyDTO {
  communityId: string;
  activatedBy: string; // userId
  type: EmergencyType;
  severity: EmergencySeverity;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface INotificationService {
  notifyCommunity(communityId: string, message: string): Promise<void>;
  notifyUser(userId: string, message: string): Promise<void>;
  sendSMS(phone: string, message: string): Promise<void>;
}

export class ActivateEmergency {
  constructor(
    private readonly emergencyRepository: IEmergencyRepository,
    private readonly communityRepository: ICommunityRepository,
    private readonly userRepository: IUserRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(dto: ActivateEmergencyDTO): Promise<Emergency> {
    // Verify community exists
    const community = await this.communityRepository.findById(dto.communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    // Verify activator is a member
    const activator = await this.userRepository.findById(dto.activatedBy);
    if (!activator) {
      throw new Error('User not found');
    }
    if (activator.communityId !== dto.communityId) {
      throw new Error('User is not a member of this community');
    }

    // Create emergency
    const emergency = new Emergency({
      communityId: dto.communityId,
      type: dto.type,
      severity: dto.severity,
      title: dto.title,
      description: dto.description,
      latitude: dto.latitude,
      longitude: dto.longitude,
      radiusKm: dto.radiusKm,
      activatedBy: dto.activatedBy,
    });

    const saved = await this.emergencyRepository.save(emergency);

    // Notify all community members
    await this.notificationService.notifyCommunity(
      dto.communityId,
      `🚨 EMERGENCY ACTIVATED: ${dto.title} - ${dto.type} (${dto.severity}). Open Hestia for details.`
    );

    // SMS vulnerable members directly
    const vulnerableUsers = await this.userRepository.findVulnerableInArea(
      dto.latitude,
      dto.longitude,
      dto.radiusKm
    );

    for (const user of vulnerableUsers) {
      await this.notificationService.sendSMS(
        user.phone,
        `🆘 HESTIA ALERT: ${dto.type} emergency in your area. ${dto.title}. Open app or call for help.`
      );
    }

    return saved;
  }
}
