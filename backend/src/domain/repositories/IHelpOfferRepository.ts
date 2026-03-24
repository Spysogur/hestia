import { HelpOffer, HelpOfferStatus } from '../entities/HelpOffer';
import { HelpRequestType } from '../entities/HelpRequest';

export interface IHelpOfferRepository {
  findById(id: string): Promise<HelpOffer | null>;
  findByEmergency(emergencyId: string): Promise<HelpOffer[]>;
  findByVolunteer(volunteerId: string): Promise<HelpOffer[]>;
  findAvailableByEmergency(emergencyId: string): Promise<HelpOffer[]>;
  findAvailableByType(emergencyId: string, type: HelpRequestType): Promise<HelpOffer[]>;
  findByStatus(emergencyId: string, status: HelpOfferStatus): Promise<HelpOffer[]>;
  save(offer: HelpOffer): Promise<HelpOffer>;
  update(offer: HelpOffer): Promise<HelpOffer>;
  delete(id: string): Promise<void>;
}
