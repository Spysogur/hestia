// ─── Enums ───────────────────────────────────────────────────────────────────

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

export enum EmergencyType {
  WILDFIRE = 'WILDFIRE',
  EARTHQUAKE = 'EARTHQUAKE',
  FLOOD = 'FLOOD',
  STORM = 'STORM',
  TSUNAMI = 'TSUNAMI',
  LANDSLIDE = 'LANDSLIDE',
  HEATWAVE = 'HEATWAVE',
  OTHER = 'OTHER',
}

export enum EmergencySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum EmergencyStatus {
  ACTIVE = 'ACTIVE',
  MONITORING = 'MONITORING',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export enum HelpRequestType {
  EVACUATION = 'EVACUATION',
  MEDICAL = 'MEDICAL',
  SHELTER = 'SHELTER',
  SUPPLIES = 'SUPPLIES',
  TRANSPORT = 'TRANSPORT',
  RESCUE = 'RESCUE',
  INFORMATION = 'INFORMATION',
  OTHER = 'OTHER',
}

export enum HelpRequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum HelpRequestStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum HelpOfferStatus {
  AVAILABLE = 'AVAILABLE',
  MATCHED = 'MATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  skills: string[];
  vulnerabilities: VulnerabilityType[];
  resources: string[];
  latitude?: number;
  longitude?: number;
  communityId?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  country: string;
  region: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Emergency {
  id: string;
  communityId: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  activatedBy: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface HelpRequest {
  id: string;
  emergencyId: string;
  requesterId: string;
  type: HelpRequestType;
  priority: HelpRequestPriority;
  status: HelpRequestStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  numberOfPeople: number;
  matchedVolunteerId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface HelpOffer {
  id: string;
  emergencyId: string;
  volunteerId: string;
  type: HelpRequestType;
  status: HelpOfferStatus;
  description: string;
  latitude: number;
  longitude: number;
  capacity: number;
  matchedRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  communityId?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  skills: string[];
  vulnerabilities: VulnerabilityType[];
  resources: string[];
  latitude?: number;
  longitude?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}
