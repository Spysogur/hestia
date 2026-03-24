import { v4 as uuidv4 } from 'uuid';

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

export interface HelpRequestProps {
  id?: string;
  emergencyId: string;
  requesterId: string;
  type: HelpRequestType;
  priority: HelpRequestPriority;
  status?: HelpRequestStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  numberOfPeople: number;
  matchedVolunteerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export class HelpRequest {
  public readonly id: string;
  public emergencyId: string;
  public requesterId: string;
  public type: HelpRequestType;
  public priority: HelpRequestPriority;
  public status: HelpRequestStatus;
  public title: string;
  public description: string;
  public latitude: number;
  public longitude: number;
  public numberOfPeople: number;
  public matchedVolunteerId?: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public completedAt?: Date;

  constructor(props: HelpRequestProps) {
    this.id = props.id ?? uuidv4();
    this.emergencyId = props.emergencyId;
    this.requesterId = props.requesterId;
    this.type = props.type;
    this.priority = props.priority;
    this.status = props.status ?? HelpRequestStatus.OPEN;
    this.title = props.title;
    this.description = props.description;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.numberOfPeople = props.numberOfPeople;
    this.matchedVolunteerId = props.matchedVolunteerId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.completedAt = props.completedAt;
  }

  public isOpen(): boolean {
    return this.status === HelpRequestStatus.OPEN;
  }

  public isUrgent(): boolean {
    return this.priority === HelpRequestPriority.URGENT;
  }

  public matchVolunteer(volunteerId: string): void {
    this.matchedVolunteerId = volunteerId;
    this.status = HelpRequestStatus.MATCHED;
    this.updatedAt = new Date();
  }

  public startProgress(): void {
    this.status = HelpRequestStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  public complete(): void {
    this.status = HelpRequestStatus.COMPLETED;
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  public cancel(): void {
    this.status = HelpRequestStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public escalatePriority(): void {
    const levels = [
      HelpRequestPriority.LOW,
      HelpRequestPriority.MEDIUM,
      HelpRequestPriority.HIGH,
      HelpRequestPriority.URGENT,
    ];
    const currentIndex = levels.indexOf(this.priority);
    if (currentIndex < levels.length - 1) {
      this.priority = levels[currentIndex + 1];
      this.updatedAt = new Date();
    }
  }
}
