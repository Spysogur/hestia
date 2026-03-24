import { Pool } from 'pg';
import { ICommunityRepository } from '../../../domain/repositories/ICommunityRepository';
import { Community } from '../../../domain/entities/Community';

const SELECT_COLS = `
  id, name, description,
  ST_X(location::geometry) AS longitude,
  ST_Y(location::geometry) AS latitude,
  radius_km, country, region, is_active, member_count, created_at, updated_at
`;

export class PostgresCommunityRepository implements ICommunityRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: Record<string, unknown>): Community {
    return new Community({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      latitude: parseFloat(row.latitude as string),
      longitude: parseFloat(row.longitude as string),
      radiusKm: parseFloat(row.radius_km as string),
      country: row.country as string,
      region: row.region as string,
      isActive: row.is_active as boolean,
      memberCount: row.member_count as number,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }

  async findById(id: string): Promise<Community | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM communities WHERE id = $1`,
      [id],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByName(name: string): Promise<Community | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM communities WHERE name = $1`,
      [name],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findNearby(lat: number, lng: number, radiusKm: number): Promise<Community[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM communities
       WHERE ST_DWithin(location, ST_MakePoint($2, $1)::geography, $3 * 1000)
       ORDER BY ST_Distance(location, ST_MakePoint($2, $1)::geography)`,
      [lat, lng, radiusKm],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findByCountry(country: string): Promise<Community[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM communities WHERE country = $1`,
      [country],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findAll(): Promise<Community[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM communities ORDER BY name`,
    );
    return rows.map((r) => this.mapRow(r));
  }

  async save(community: Community): Promise<Community> {
    const { rows } = await this.pool.query(
      `INSERT INTO communities (
         id, name, description, location, radius_km, country, region,
         is_active, member_count, created_at, updated_at
       ) VALUES (
         $1, $2, $3, ST_MakePoint($5, $4)::geography, $6, $7, $8, $9, $10, $11, $12
       )
       RETURNING ${SELECT_COLS}`,
      [
        community.id, community.name, community.description,
        community.latitude, community.longitude,
        community.radiusKm, community.country, community.region,
        community.isActive, community.memberCount, community.createdAt, community.updatedAt,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async update(community: Community): Promise<Community> {
    const { rows } = await this.pool.query(
      `UPDATE communities SET
         name         = $2,
         description  = $3,
         location     = ST_MakePoint($5, $4)::geography,
         radius_km    = $6,
         country      = $7,
         region       = $8,
         is_active    = $9,
         member_count = $10,
         updated_at   = $11
       WHERE id = $1
       RETURNING ${SELECT_COLS}`,
      [
        community.id, community.name, community.description,
        community.latitude, community.longitude,
        community.radiusKm, community.country, community.region,
        community.isActive, community.memberCount, community.updatedAt,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM communities WHERE id = $1', [id]);
  }
}
