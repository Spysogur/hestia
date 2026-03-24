import { Pool } from 'pg';
import { IEmergencyRepository } from '../../../domain/repositories/IEmergencyRepository';
import {
  Emergency,
  EmergencyType,
  EmergencySeverity,
  EmergencyStatus,
} from '../../../domain/entities/Emergency';

const SELECT_COLS = `
  id, community_id, type, severity, status, title, description,
  ST_X(location::geometry) AS longitude,
  ST_Y(location::geometry) AS latitude,
  radius_km, activated_by, resolved_by, created_at, updated_at, resolved_at
`;

export class PostgresEmergencyRepository implements IEmergencyRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: Record<string, unknown>): Emergency {
    return new Emergency({
      id: row.id as string,
      communityId: row.community_id as string,
      type: row.type as EmergencyType,
      severity: row.severity as EmergencySeverity,
      status: row.status as EmergencyStatus,
      title: row.title as string,
      description: row.description as string,
      latitude: parseFloat(row.latitude as string),
      longitude: parseFloat(row.longitude as string),
      radiusKm: parseFloat(row.radius_km as string),
      activatedBy: row.activated_by as string,
      resolvedBy: (row.resolved_by as string) ?? undefined,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
      resolvedAt: (row.resolved_at as Date) ?? undefined,
    });
  }

  async findById(id: string): Promise<Emergency | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM emergencies WHERE id = $1`,
      [id],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByCommunity(communityId: string): Promise<Emergency[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM emergencies WHERE community_id = $1 ORDER BY created_at DESC`,
      [communityId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findActive(): Promise<Emergency[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM emergencies WHERE status = 'ACTIVE' ORDER BY created_at DESC`,
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findActiveByCommunity(communityId: string): Promise<Emergency[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM emergencies
       WHERE community_id = $1 AND status = 'ACTIVE'
       ORDER BY created_at DESC`,
      [communityId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findByStatus(status: EmergencyStatus): Promise<Emergency[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM emergencies WHERE status = $1::emergency_status ORDER BY created_at DESC`,
      [status],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findInArea(lat: number, lng: number, radiusKm: number): Promise<Emergency[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM emergencies
       WHERE ST_DWithin(location, ST_MakePoint($2, $1)::geography, $3 * 1000)
       ORDER BY created_at DESC`,
      [lat, lng, radiusKm],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async save(emergency: Emergency): Promise<Emergency> {
    const { rows } = await this.pool.query(
      `INSERT INTO emergencies (
         id, community_id, type, severity, status, title, description,
         location, radius_km, activated_by, resolved_by, created_at, updated_at, resolved_at
       ) VALUES (
         $1, $2, $3::emergency_type, $4::emergency_severity, $5::emergency_status,
         $6, $7, ST_MakePoint($9, $8)::geography, $10, $11, $12, $13, $14, $15
       )
       RETURNING ${SELECT_COLS}`,
      [
        emergency.id, emergency.communityId, emergency.type, emergency.severity, emergency.status,
        emergency.title, emergency.description,
        emergency.latitude, emergency.longitude,
        emergency.radiusKm, emergency.activatedBy, emergency.resolvedBy ?? null,
        emergency.createdAt, emergency.updatedAt, emergency.resolvedAt ?? null,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async update(emergency: Emergency): Promise<Emergency> {
    const { rows } = await this.pool.query(
      `UPDATE emergencies SET
         community_id = $2,
         type         = $3::emergency_type,
         severity     = $4::emergency_severity,
         status       = $5::emergency_status,
         title        = $6,
         description  = $7,
         location     = ST_MakePoint($9, $8)::geography,
         radius_km    = $10,
         activated_by = $11,
         resolved_by  = $12,
         updated_at   = $13,
         resolved_at  = $14
       WHERE id = $1
       RETURNING ${SELECT_COLS}`,
      [
        emergency.id, emergency.communityId, emergency.type, emergency.severity, emergency.status,
        emergency.title, emergency.description,
        emergency.latitude, emergency.longitude,
        emergency.radiusKm, emergency.activatedBy, emergency.resolvedBy ?? null,
        emergency.updatedAt, emergency.resolvedAt ?? null,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM emergencies WHERE id = $1', [id]);
  }
}
