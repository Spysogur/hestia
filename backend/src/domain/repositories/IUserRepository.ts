import { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCommunity(communityId: string): Promise<User[]>;
  findVulnerableInArea(lat: number, lng: number, radiusKm: number): Promise<User[]>;
  findWithResourceInArea(resource: string, lat: number, lng: number, radiusKm: number): Promise<User[]>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
