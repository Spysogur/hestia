import { Pool } from 'pg';
import { IHelpOfferRepository } from '../../../domain/repositories/IHelpOfferRepository';
import { HelpOffer, HelpOfferStatus } from '../../../domain/entities/HelpOffer';
import { HelpRequestType } from '../../../domain/entities/HelpRequest';

const SELECT_COLS = `
  id, emergency_id, volunteer_id, type, status, description,
  ST_X(location::geometry) AS longitude,
  ST_Y(location::geometry) AS latitude,
  capacity, matched_request_id, created_at, updated_at
`;

export class PostgresHelpOfferRepository implements IHelpOfferRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: Record<string, unknown>): HelpOffer {
    return new HelpOffer({
      id: row.id as string,
      emergencyId: row.emergency_id as string,
      volunteerId: row.volunteer_id as string,
      type: row.type as HelpRequestType,
      status: row.status as HelpOfferStatus,
      description: row.description as string,
      latitude: parseFloat(row.latitude as string),
      longitude: parseFloat(row.longitude as string),
      capacity: row.capacity as number,
      matchedRequestId: (row.matched_request_id as string) ?? undefined,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }

  async findById(id: string): Promise<HelpOffer | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM help_offers WHERE id = $1`,
      [id],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByEmergency(emergencyId: string): Promise<HelpOffer[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM help_offers WHERE emergency_id = $1 ORDER BY created_at DESC`,
      [emergencyId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findByVolunteer(volunteerId: string): Promise<HelpOffer[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM help_offers WHERE volunteer_id = $1 ORDER BY created_at DESC`,
      [volunteerId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findAvailableByEmergency(emergencyId: string): Promise<HelpOffer[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM help_offers
       WHERE emergency_id = $1 AND status = 'AVAILABLE'
       ORDER BY created_at ASC`,
      [emergencyId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findAvailableByType(emergencyId: string, type: HelpRequestType): Promise<HelpOffer[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM help_offers
       WHERE emergency_id = $1 AND type = $2::help_request_type AND status = 'AVAILABLE'
       ORDER BY created_at ASC`,
      [emergencyId, type],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findByStatus(emergencyId: string, status: HelpOfferStatus): Promise<HelpOffer[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM help_offers
       WHERE emergency_id = $1 AND status = $2::help_offer_status
       ORDER BY created_at DESC`,
      [emergencyId, status],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async save(offer: HelpOffer): Promise<HelpOffer> {
    const { rows } = await this.pool.query(
      `INSERT INTO help_offers (
         id, emergency_id, volunteer_id, type, status, description,
         location, capacity, matched_request_id, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4::help_request_type, $5::help_offer_status, $6,
         ST_MakePoint($8, $7)::geography,
         $9, $10, $11, $12
       )
       RETURNING ${SELECT_COLS}`,
      [
        offer.id, offer.emergencyId, offer.volunteerId,
        offer.type, offer.status, offer.description,
        offer.latitude, offer.longitude,
        offer.capacity, offer.matchedRequestId ?? null,
        offer.createdAt, offer.updatedAt,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async update(offer: HelpOffer): Promise<HelpOffer> {
    const { rows } = await this.pool.query(
      `UPDATE help_offers SET
         emergency_id       = $2,
         volunteer_id       = $3,
         type               = $4::help_request_type,
         status             = $5::help_offer_status,
         description        = $6,
         location           = ST_MakePoint($8, $7)::geography,
         capacity           = $9,
         matched_request_id = $10,
         updated_at         = $11
       WHERE id = $1
       RETURNING ${SELECT_COLS}`,
      [
        offer.id, offer.emergencyId, offer.volunteerId,
        offer.type, offer.status, offer.description,
        offer.latitude, offer.longitude,
        offer.capacity, offer.matchedRequestId ?? null,
        offer.updatedAt,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM help_offers WHERE id = $1', [id]);
  }
}
