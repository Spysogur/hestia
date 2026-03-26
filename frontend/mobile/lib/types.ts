// ---- Enums ----

export enum EmergencyType {
  FIRE = "FIRE",
  FLOOD = "FLOOD",
  EARTHQUAKE = "EARTHQUAKE",
  MEDICAL = "MEDICAL",
  STORM = "STORM",
  CHEMICAL = "CHEMICAL",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  OTHER = "OTHER",
}

export enum EmergencySeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum EmergencyStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  ESCALATED = "ESCALATED",
}

export enum HelpRequestStatus {
  PENDING = "PENDING",
  MATCHED = "MATCHED",
  FULFILLED = "FULFILLED",
}

export enum HelpOfferStatus {
  AVAILABLE = "AVAILABLE",
  MATCHED = "MATCHED",
  COMPLETED = "COMPLETED",
}

export enum HelpType {
  MEDICAL = "MEDICAL",
  FOOD = "FOOD",
  SHELTER = "SHELTER",
  TRANSPORT = "TRANSPORT",
  RESCUE = "RESCUE",
  SUPPLIES = "SUPPLIES",
  OTHER = "OTHER",
}

export enum HelpRequestPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// ---- User & Auth ----

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role?: string;
  isVerified?: boolean;
  skills?: string[];
  vulnerabilities?: string[];
  resources?: string[];
  latitude?: number;
  longitude?: number;
  communityId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  skills?: string[];
  vulnerabilities?: string[];
  resources?: string[];
  latitude?: number;
  longitude?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ---- Community ----

export interface Community {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius?: number;
  isActive?: boolean;
  region?: string;
  country?: string;
  memberCount?: number;
  createdAt: string;
}

// ---- Emergency ----

export interface Emergency {
  id: string;
  title: string;
  description?: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  communityId: string;
  latitude?: number;
  longitude?: number;
  createdById: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ActivateEmergencyPayload {
  title: string;
  description?: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  communityId: string;
  latitude?: number;
  longitude?: number;
}

// ---- Help ----

export interface HelpRequest {
  id: string;
  emergencyId: string;
  userId: string;
  description: string;
  requestType: string;
  status: HelpRequestStatus;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface HelpOffer {
  id: string;
  emergencyId: string;
  userId: string;
  description: string;
  offerType: string;
  status: HelpOfferStatus;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface CreateHelpRequestPayload {
  emergencyId: string;
  description: string;
  requestType: string;
  title?: string;
  priority?: string;
  numberOfPeople?: number;
  latitude?: number;
  longitude?: number;
}

export interface CreateHelpOfferPayload {
  emergencyId: string;
  description: string;
  offerType: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
}

// ---- API ----

export interface ApiResponse<T> {
  status: string;
  data: T;
}
