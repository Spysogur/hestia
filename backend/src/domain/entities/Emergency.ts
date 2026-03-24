import { v4 as uuidv4 } from 'uuid';

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

export interface EmergencyProps {
  id?: string;
  communityId: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  status?: EmergencyStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusKm: number; // affected area
  activatedBy: string; // userId
  resolvedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
}

export class Emergency {
  public readonly id: string;
  public communityId: string;
  public type: EmergencyType;
  public severity: EmergencySeverity;
  public status: EmergencyStatus;
  public title: string;
  public description: string;
  public latitude: number;
  public longitude: number;
  public radiusKm: number;
  public activatedBy: string;
  public resolvedBy?: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public resolvedAt?: Date;

  constructor(props: EmergencyProps) {
    this.id = props.id ?? uuidv4();
    this.communityId = props.communityId;
    this.type = props.type;
    this.severity = props.severity;
    this.status = props.status ?? EmergencyStatus.ACTIVE;
    this.title = props.title;
    this.description = props.description;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.radiusKm = props.radiusKm;
    this.activatedBy = props.activatedBy;
    this.resolvedBy = props.resolvedBy;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.resolvedAt = props.resolvedAt;
  }

  public isActive(): boolean {
    return this.status === EmergencyStatus.ACTIVE;
  }

  public isCritical(): boolean {
    return this.severity === EmergencySeverity.CRITICAL;
  }

  public escalate(): void {
    const levels = [
      EmergencySeverity.LOW,
      EmergencySeverity.MEDIUM,
      EmergencySeverity.HIGH,
      EmergencySeverity.CRITICAL,
    ];
    const currentIndex = levels.indexOf(this.severity);
    if (currentIndex < levels.length - 1) {
      this.severity = levels[currentIndex + 1];
      this.updatedAt = new Date();
    }
  }

  public resolve(resolvedBy: string): void {
    this.status = EmergencyStatus.RESOLVED;
    this.resolvedBy = resolvedBy;
    this.resolvedAt = new Date();
    this.updatedAt = new Date();
  }

  public cancel(cancelledBy: string): void {
    this.status = EmergencyStatus.CANCELLED;
    this.resolvedBy = cancelledBy;
    this.resolvedAt = new Date();
    this.updatedAt = new Date();
  }

  public expandRadius(additionalKm: number): void {
    this.radiusKm += additionalKm;
    this.updatedAt = new Date();
  }

  public isLocationAffected(lat: number, lng: number): boolean {
    const R = 6371;
    const dLat = ((lat - this.latitude) * Math.PI) / 180;
    const dLng = ((lng - this.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((this.latitude * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c <= this.radiusKm;
  }
}
