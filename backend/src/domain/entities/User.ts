import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  MEMBER = 'MEMBER',
  COORDINATOR = 'COORDINATOR',
  ADMIN = 'ADMIN',
}

export enum VulnerabilityType {
  ELDERLY = 'ELDERLY',
  DISABLED = 'DISABLED',
  NO_VEHICLE = 'NO_VEHICLE',
  MEDICAL_CONDITION = 'MEDICAL_CONDITION',
  CHILDREN = 'CHILDREN',
  LIMITED_MOBILITY = 'LIMITED_MOBILITY',
}

export interface UserProps {
  id?: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  role: UserRole;
  skills: string[];
  vulnerabilities: VulnerabilityType[];
  resources: string[]; // e.g., "truck", "generator", "first-aid-kit"
  latitude?: number;
  longitude?: number;
  communityId?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  public email: string;
  public passwordHash: string;
  public fullName: string;
  public phone: string;
  public role: UserRole;
  public skills: string[];
  public vulnerabilities: VulnerabilityType[];
  public resources: string[];
  public latitude?: number;
  public longitude?: number;
  public communityId?: string;
  public isVerified: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id ?? uuidv4();
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.fullName = props.fullName;
    this.phone = props.phone;
    this.role = props.role;
    this.skills = props.skills;
    this.vulnerabilities = props.vulnerabilities;
    this.resources = props.resources;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.communityId = props.communityId;
    this.isVerified = props.isVerified;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public updateLocation(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;
    this.updatedAt = new Date();
  }

  public joinCommunity(communityId: string): void {
    this.communityId = communityId;
    this.updatedAt = new Date();
  }

  public addSkill(skill: string): void {
    if (!this.skills.includes(skill)) {
      this.skills.push(skill);
      this.updatedAt = new Date();
    }
  }

  public addResource(resource: string): void {
    if (!this.resources.includes(resource)) {
      this.resources.push(resource);
      this.updatedAt = new Date();
    }
  }

  public isVulnerable(): boolean {
    return this.vulnerabilities.length > 0;
  }

  public hasVehicle(): boolean {
    return !this.vulnerabilities.includes(VulnerabilityType.NO_VEHICLE);
  }
}
