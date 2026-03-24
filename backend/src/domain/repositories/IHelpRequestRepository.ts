import { HelpRequest, HelpRequestStatus, HelpRequestType } from '../entities/HelpRequest';

export interface IHelpRequestRepository {
  findById(id: string): Promise<HelpRequest | null>;
  findByEmergency(emergencyId: string): Promise<HelpRequest[]>;
  findByRequester(requesterId: string): Promise<HelpRequest[]>;
  findOpenByEmergency(emergencyId: string): Promise<HelpRequest[]>;
  findByType(emergencyId: string, type: HelpRequestType): Promise<HelpRequest[]>;
  findByStatus(emergencyId: string, status: HelpRequestStatus): Promise<HelpRequest[]>;
  findUrgent(emergencyId: string): Promise<HelpRequest[]>;
  save(request: HelpRequest): Promise<HelpRequest>;
  update(request: HelpRequest): Promise<HelpRequest>;
  delete(id: string): Promise<void>;
}
