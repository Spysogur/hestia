CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE user_role AS ENUM ('MEMBER', 'COORDINATOR', 'ADMIN');
CREATE TYPE vulnerability_type AS ENUM (
  'ELDERLY', 'DISABLED', 'NO_VEHICLE', 'MEDICAL_CONDITION', 'CHILDREN', 'LIMITED_MOBILITY'
);

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(50) NOT NULL,
  role            user_role NOT NULL DEFAULT 'MEMBER',
  skills          TEXT[] NOT NULL DEFAULT '{}',
  vulnerabilities vulnerability_type[] NOT NULL DEFAULT '{}',
  resources       TEXT[] NOT NULL DEFAULT '{}',
  location        GEOGRAPHY(POINT, 4326),
  community_id    UUID,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_community  ON users (community_id);
CREATE INDEX idx_users_role       ON users (role);
CREATE INDEX idx_users_location   ON users USING GIST (location);
