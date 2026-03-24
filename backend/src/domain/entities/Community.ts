import { v4 as uuidv4 } from 'uuid';

export interface CommunityProps {
  id?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusKm: number; // coverage area
  country: string;
  region: string;
  isActive: boolean;
  memberCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Community {
  public readonly id: string;
  public name: string;
  public description: string;
  public latitude: number;
  public longitude: number;
  public radiusKm: number;
  public country: string;
  public region: string;
  public isActive: boolean;
  public memberCount: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: CommunityProps) {
    this.id = props.id ?? uuidv4();
    this.name = props.name;
    this.description = props.description;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.radiusKm = props.radiusKm;
    this.country = props.country;
    this.region = props.region;
    this.isActive = props.isActive;
    this.memberCount = props.memberCount ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public incrementMemberCount(): void {
    this.memberCount++;
    this.updatedAt = new Date();
  }

  public decrementMemberCount(): void {
    if (this.memberCount > 0) {
      this.memberCount--;
      this.updatedAt = new Date();
    }
  }

  public isWithinRadius(lat: number, lng: number): boolean {
    const distance = this.haversineDistance(lat, lng);
    return distance <= this.radiusKm;
  }

  private haversineDistance(lat: number, lng: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat - this.latitude);
    const dLng = this.toRad(lng - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
        Math.cos(this.toRad(lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
