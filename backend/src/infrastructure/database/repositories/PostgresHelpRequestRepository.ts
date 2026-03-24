import { Pool } from 'pg';
import { IHelpRequestRepository } from '../../../domain/repositories/IHelpRequestRepository';
import {
  HelpRequest,
  HelpRequestType,
  HelpRequestPriority,
  HelpRequestStatus,
} from '../../../domain/entities/HelpRequest';

const SELECT_COLS = `
  id, emergency_id, requester_id, type, priority, status, title, description,
  ST_X(location::geometry) AS longitude,
  ST_Y(location::geometry) AS latitude,
  number_of_people, matched_volunteer_id, created_at, updated_at, completed_at
`;

export class PostgresHelpRequestRepository implements IHelpRequestRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: Record<string, unknown>): HelpRequest {
    return new HelpRequest({
      id: row.id as string,
      emergencyId: row.emergency_id as string,
      requesterId: row.requester_id as string,
      type: row.type as HelpRequestType,
      priority: row.priority as HelpRequestPriority,
      status: row.status as HelpRequestStatus,
      title: row.title as string,
      description: row.description as string,
      latitude: parseFloat(row.latitude as string),
      longitude: parseFloat(row.longitude as string),
      numberOfPeople: row.number_of_people as number,
      matchedVolunteerId: (row.matched_volunteer_id as string) ?? undefined,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
      completedAt: (row.completed_at as Date) ?? undefined,
    });
  }

  async findById(id: string): Promise<HelpRequest | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM help_requests WHERE id = $1`,
      [id],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByEmergency(emergencyId: string): Promise<HelpRequest[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM help_requests WHERE emergency_id = $1 ORDER BY created_at DESC`,
      [emergencyId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findByRequester(requesterId: string): Promise<HelpRequest[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM help_requests WHERE requester_id = $1 ORDER BY created_at DESC`,
      [requesterId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findOpenByEmergency(emergencyId: string): Promise<HelpRequest[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM help_requests
       WHERE emergency_id = $1 AND status = 'OPEN'
       ORDER BY priority DESC, created_at ASC`,
      [emergencyId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findByType(emergencyId: string, type: HelpRequestType): Promise<HelpRequest[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM help_requests
       WHERE emergency_id = $1 AND type = $2::help_request_type
       ORDER BY created_at DESC`,
      [emergencyId, type],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findByStatus(emergencyId: string, status: HelpRequestStatus): Promise<HelpRequest[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM help_requests
       WHERE emergency_id = $1 AND status = $2::help_request_status
       ORDER BY created_at DESC`,
      [emergencyId, status],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findUrgent(emergencyId: string): Promise<HelpRequest[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM help_requests
       WHERE emergency_id = $1 AND priority = 'URGENT' AND status NOT IN ('COMPLETED', 'CANCELLED')
       ORDER BY created_at ASC`,
      [emergencyId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async save(request: HelpRequest): Promise<HelpRequest> {
    const { rows } = await this.pool.query(
      `INSERT INTO help_requests (
         id, emergency_id, requester_id, type, priority, status, title, description,
         location, number_of_people, matched_volunteer_id, created_at, updated_at, completed_at
       ) VALUES (
         $1, $2, $3, $4::help_request_type, $5::help_request_priority,
         $6::help_request_status, $7, $8,
         ST_MakePoint($10, $9)::geography,
         $11, $12, $13, $14, $15
       )
       RETURNING ${SELECT_COLS}`,
      [
        request.id, request.emergencyId, request.requesterId,
        request.type, request.priority, request.status,
        request.title, request.description,
        request.latitude, request.longitude,
        request.numberOfPeople, request.matchedVolunteerId ?? null,
        request.createdAt, request.updatedAt, request.completedAt ?? null,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async update(request: HelpRequest): Promise<HelpRequest> {
    const { rows } = await this.pool.query(
      `UPDATE help_requests SET
         emergency_id         = $2,
         requester_id         = $3,
         type                 = $4::help_request_type,
         priority             = $5::help_request_priority,
         status               = $6::help_request_status,
         title                = $7,
         description          = $8,
         location             = ST_MakePoint($10, $9)::geography,
         number_of_people     = $11,
         matched_volunteer_id = $12,
         updated_at           = $13,
         completed_at         = $14
       WHERE id = $1
       RETURNING ${SELECT_COLS}`,
      [
        request.id, request.emergencyId, request.requesterId,
        request.type, request.priority, request.status,
        request.title, request.description,
        request.latitude, request.longitude,
        request.numberOfPeople, request.matchedVolunteerId ?? null,
        request.updatedAt, request.completedAt ?? null,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM help_requests WHERE id = $1', [id]);
  }
}
