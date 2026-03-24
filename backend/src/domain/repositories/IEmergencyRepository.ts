import { Emergency, EmergencyStatus } from '../entities/Emergency';

export interface IEmergencyRepository {
  findById(id: string): Promise<Emergency | null>;
  findByCommunity(communityId: string): Promise<Emergency[]>;
  findActive(): Promise<Emergency[]>;
  findActiveByCommunity(communityId: string): Promise<Emergency[]>;
  findByStatus(status: EmergencyStatus): Promise<Emergency[]>;
  findInArea(lat: number, lng: number, radiusKm: number): Promise<Emergency[]>;
  save(emergency: Emergency): Promise<Emergency>;
  update(emergency: Emergency): Promise<Emergency>;
  delete(id: string): Promise<void>;
}
