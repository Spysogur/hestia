import { Server } from 'socket.io';
import { pool } from '../database/pool';
import { PostgresUserRepository } from '../database/repositories/PostgresUserRepository';
import { PostgresCommunityRepository } from '../database/repositories/PostgresCommunityRepository';
import { PostgresEmergencyRepository } from '../database/repositories/PostgresEmergencyRepository';
import { PostgresHelpRequestRepository } from '../database/repositories/PostgresHelpRequestRepository';
import { PostgresHelpOfferRepository } from '../database/repositories/PostgresHelpOfferRepository';
import { BcryptPasswordHasher } from '../auth/passwordHasher';
import { JwtService } from '../auth/jwt';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { LoginUser } from '../../application/use-cases/LoginUser';
import { CreateCommunity } from '../../application/use-cases/CreateCommunity';
import { JoinCommunity } from '../../application/use-cases/JoinCommunity';
import { ActivateEmergency, INotificationService } from '../../application/use-cases/ActivateEmergency';
import { GetActiveEmergencies } from '../../application/use-cases/GetActiveEmergencies';
import { ResolveEmergency } from '../../application/use-cases/ResolveEmergency';
import { CreateHelpRequest } from '../../application/use-cases/CreateHelpRequest';
import { CreateHelpOffer } from '../../application/use-cases/CreateHelpOffer';

class SocketNotificationService implements INotificationService {
  constructor(private readonly io?: Server) {}

  async notifyCommunity(communityId: string, message: string): Promise<void> {
    this.io?.to(`community:${communityId}`).emit('notification', { message });
  }

  async notifyUser(userId: string, message: string): Promise<void> {
    this.io?.to(`user:${userId}`).emit('notification', { message });
  }

  async sendSMS(phone: string, message: string): Promise<void> {
    // SMS integration point (e.g. Twilio)
    console.log(`[SMS] ${phone}: ${message}`);
  }
}

export function createContainer(io?: Server) {
  const userRepository = new PostgresUserRepository(pool);
  const communityRepository = new PostgresCommunityRepository(pool);
  const emergencyRepository = new PostgresEmergencyRepository(pool);
  const helpRequestRepository = new PostgresHelpRequestRepository(pool);
  const helpOfferRepository = new PostgresHelpOfferRepository(pool);

  const passwordHasher = new BcryptPasswordHasher();
  const jwtService = new JwtService();
  const notificationService = new SocketNotificationService(io);

  const registerUser = new RegisterUser(userRepository, passwordHasher);
  const loginUser = new LoginUser(userRepository, passwordHasher, jwtService);
  const createCommunity = new CreateCommunity(communityRepository);
  const joinCommunity = new JoinCommunity(userRepository, communityRepository);
  const activateEmergency = new ActivateEmergency(
    emergencyRepository,
    communityRepository,
    userRepository,
    notificationService
  );
  const getActiveEmergencies = new GetActiveEmergencies(emergencyRepository);
  const resolveEmergency = new ResolveEmergency(emergencyRepository);
  const createHelpRequest = new CreateHelpRequest(
    helpRequestRepository,
    emergencyRepository,
    helpOfferRepository
  );
  const createHelpOffer = new CreateHelpOffer(helpOfferRepository, emergencyRepository);

  return {
    jwtService,
    repositories: {
      userRepository,
      communityRepository,
      emergencyRepository,
      helpRequestRepository,
      helpOfferRepository,
    },
    useCases: {
      registerUser,
      loginUser,
      createCommunity,
      joinCommunity,
      activateEmergency,
      getActiveEmergencies,
      resolveEmergency,
      createHelpRequest,
      createHelpOffer,
    },
  };
}

export type Container = ReturnType<typeof createContainer>;
