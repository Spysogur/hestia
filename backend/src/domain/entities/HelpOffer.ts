import { v4 as uuidv4 } from 'uuid';
import { HelpRequestType } from './HelpRequest';

export enum HelpOfferStatus {
  AVAILABLE = 'AVAILABLE',
  MATCHED = 'MATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface HelpOfferProps {
  id?: string;
  emergencyId: string;
  volunteerId: string;
  type: HelpRequestType;
  status?: HelpOfferStatus;
  description: string;
  latitude: number;
  longitude: number;
  capacity?: number; // e.g., seats in car, beds available
  matchedRequestId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class HelpOffer {
  public readonly id: string;
  public emergencyId: string;
  public volunteerId: string;
  public type: HelpRequestType;
  public status: HelpOfferStatus;
  public description: string;
  public latitude: number;
  public longitude: number;
  public capacity: number;
  public matchedRequestId?: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: HelpOfferProps) {
    this.id = props.id ?? uuidv4();
    this.emergencyId = props.emergencyId;
    this.volunteerId = props.volunteerId;
    this.type = props.type;
    this.status = props.status ?? HelpOfferStatus.AVAILABLE;
    this.description = props.description;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.capacity = props.capacity ?? 1;
    this.matchedRequestId = props.matchedRequestId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public isAvailable(): boolean {
    return this.status === HelpOfferStatus.AVAILABLE;
  }

  public matchToRequest(requestId: string): void {
    this.matchedRequestId = requestId;
    this.status = HelpOfferStatus.MATCHED;
    this.updatedAt = new Date();
  }

  public startProgress(): void {
    this.status = HelpOfferStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  public complete(): void {
    this.status = HelpOfferStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  public withdraw(): void {
    this.status = HelpOfferStatus.WITHDRAWN;
    this.updatedAt = new Date();
  }
}
