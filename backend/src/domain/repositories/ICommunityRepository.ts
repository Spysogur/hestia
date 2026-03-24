import { Community } from '../entities/Community';

export interface ICommunityRepository {
  findById(id: string): Promise<Community | null>;
  findByName(name: string): Promise<Community | null>;
  findNearby(lat: number, lng: number, radiusKm: number): Promise<Community[]>;
  findByCountry(country: string): Promise<Community[]>;
  findAll(): Promise<Community[]>;
  save(community: Community): Promise<Community>;
  update(community: Community): Promise<Community>;
  delete(id: string): Promise<void>;
}
