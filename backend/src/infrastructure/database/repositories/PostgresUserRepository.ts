import { Pool } from 'pg';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User, UserRole, VulnerabilityType } from '../../../domain/entities/User';

const SELECT_COLS = `
  id, email, password_hash, full_name, phone, role, skills, vulnerabilities, resources,
  ST_X(location::geometry) AS longitude,
  ST_Y(location::geometry) AS latitude,
  community_id, is_verified, created_at, updated_at
`;

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: Record<string, unknown>): User {
    return new User({
      id: row.id as string,
      email: row.email as string,
      passwordHash: row.password_hash as string,
      fullName: row.full_name as string,
      phone: row.phone as string,
      role: row.role as UserRole,
      skills: (row.skills as string[]) ?? [],
      vulnerabilities: (row.vulnerabilities as VulnerabilityType[]) ?? [],
      resources: (row.resources as string[]) ?? [],
      latitude: row.latitude != null ? parseFloat(row.latitude as string) : undefined,
      longitude: row.longitude != null ? parseFloat(row.longitude as string) : undefined,
      communityId: (row.community_id as string) ?? undefined,
      isVerified: row.is_verified as boolean,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByCommunity(communityId: string): Promise<User[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS} FROM users WHERE community_id = $1`,
      [communityId],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findVulnerableInArea(lat: number, lng: number, radiusKm: number): Promise<User[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM users
       WHERE cardinality(vulnerabilities) > 0
         AND location IS NOT NULL
         AND ST_DWithin(location, ST_MakePoint($2, $1)::geography, $3 * 1000)`,
      [lat, lng, radiusKm],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findWithResourceInArea(
    resource: string,
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<User[]> {
    const { rows } = await this.pool.query(
      `SELECT ${SELECT_COLS}
       FROM users
       WHERE $1 = ANY(resources)
         AND location IS NOT NULL
         AND ST_DWithin(location, ST_MakePoint($3, $2)::geography, $4 * 1000)`,
      [resource, lat, lng, radiusKm],
    );
    return rows.map((r) => this.mapRow(r));
  }

  async save(user: User): Promise<User> {
    const { rows } = await this.pool.query(
      `INSERT INTO users (
         id, email, password_hash, full_name, phone, role, skills,
         vulnerabilities, resources, location, community_id, is_verified, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6::user_role, $7::text[],
         $8::vulnerability_type[], $9::text[],
         CASE WHEN $10::float8 IS NOT NULL AND $11::float8 IS NOT NULL
              THEN ST_MakePoint($11, $10)::geography ELSE NULL END,
         $12, $13, $14, $15
       )
       RETURNING ${SELECT_COLS}`,
      [
        user.id, user.email, user.passwordHash, user.fullName, user.phone,
        user.role, user.skills, user.vulnerabilities, user.resources,
        user.latitude ?? null, user.longitude ?? null,
        user.communityId ?? null, user.isVerified, user.createdAt, user.updatedAt,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async update(user: User): Promise<User> {
    const { rows } = await this.pool.query(
      `UPDATE users SET
         email         = $2,
         password_hash = $3,
         full_name     = $4,
         phone         = $5,
         role          = $6::user_role,
         skills        = $7::text[],
         vulnerabilities = $8::vulnerability_type[],
         resources     = $9::text[],
         location      = CASE WHEN $10::float8 IS NOT NULL AND $11::float8 IS NOT NULL
                              THEN ST_MakePoint($11, $10)::geography ELSE NULL END,
         community_id  = $12,
         is_verified   = $13,
         updated_at    = $14
       WHERE id = $1
       RETURNING ${SELECT_COLS}`,
      [
        user.id, user.email, user.passwordHash, user.fullName, user.phone,
        user.role, user.skills, user.vulnerabilities, user.resources,
        user.latitude ?? null, user.longitude ?? null,
        user.communityId ?? null, user.isVerified, user.updatedAt,
      ],
    );
    return this.mapRow(rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
