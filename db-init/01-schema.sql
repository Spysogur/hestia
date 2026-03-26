-- Hestia DB Schema (combined from Node.js migrations + .NET compatibility)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enums
CREATE TYPE user_role AS ENUM ('MEMBER', 'COORDINATOR', 'ADMIN');
CREATE TYPE vulnerability_type AS ENUM (
  'ELDERLY', 'DISABLED', 'NO_VEHICLE', 'MEDICAL_CONDITION', 'CHILDREN', 'LIMITED_MOBILITY'
);
CREATE TYPE emergency_type AS ENUM (
  'WILDFIRE', 'EARTHQUAKE', 'FLOOD', 'STORM', 'TSUNAMI', 'LANDSLIDE', 'HEATWAVE', 'OTHER'
);
CREATE TYPE emergency_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE emergency_status AS ENUM ('ACTIVE', 'MONITORING', 'RESOLVED', 'CANCELLED');
CREATE TYPE help_request_type AS ENUM (
  'EVACUATION', 'MEDICAL', 'SHELTER', 'SUPPLIES', 'TRANSPORT', 'RESCUE', 'INFORMATION', 'OTHER'
);
CREATE TYPE help_request_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE help_request_status AS ENUM ('OPEN', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE help_offer_status AS ENUM ('AVAILABLE', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'WITHDRAWN');
CREATE TYPE map_pin_type AS ENUM (
  'RESOURCE', 'SHELTER', 'DANGER', 'MEETING_POINT', 'MEDICAL', 'DISTRIBUTION', 'OTHER'
);

-- Users
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
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  community_id    UUID,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_community  ON users (community_id);
CREATE INDEX idx_users_role       ON users (role);
CREATE INDEX idx_users_location   ON users USING GIST (location);

-- Communities
CREATE TABLE communities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(255) UNIQUE NOT NULL,
  description  TEXT NOT NULL,
  location     GEOGRAPHY(POINT, 4326),
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  radius_km    NUMERIC(10, 2) NOT NULL,
  country      VARCHAR(100) NOT NULL DEFAULT '',
  region       VARCHAR(100) NOT NULL DEFAULT '',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE users
  ADD CONSTRAINT fk_users_community
  FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE SET NULL;
CREATE INDEX idx_communities_country  ON communities (country);
CREATE INDEX idx_communities_active   ON communities (is_active);
CREATE INDEX idx_communities_location ON communities USING GIST (location);

-- Emergencies
CREATE TABLE emergencies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities (id) ON DELETE CASCADE,
  type         emergency_type NOT NULL,
  severity     emergency_severity NOT NULL,
  status       emergency_status NOT NULL DEFAULT 'ACTIVE',
  title        VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  location     GEOGRAPHY(POINT, 4326),
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  radius_km    NUMERIC(10, 2) NOT NULL,
  activated_by UUID NOT NULL REFERENCES users (id),
  resolved_by  UUID REFERENCES users (id),
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_emergencies_community ON emergencies (community_id);
CREATE INDEX idx_emergencies_status    ON emergencies (status);
CREATE INDEX idx_emergencies_type      ON emergencies (type);
CREATE INDEX idx_emergencies_location  ON emergencies USING GIST (location);

-- Help Requests
CREATE TABLE help_requests (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_id         UUID NOT NULL REFERENCES emergencies (id) ON DELETE CASCADE,
  requester_id         UUID NOT NULL REFERENCES users (id),
  type                 help_request_type NOT NULL,
  priority             help_request_priority NOT NULL,
  status               help_request_status NOT NULL DEFAULT 'OPEN',
  title                VARCHAR(255) NOT NULL,
  description          TEXT NOT NULL,
  location             GEOGRAPHY(POINT, 4326),
  latitude             DOUBLE PRECISION,
  longitude            DOUBLE PRECISION,
  number_of_people     INTEGER NOT NULL DEFAULT 1,
  matched_volunteer_id UUID REFERENCES users (id),
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_help_requests_emergency ON help_requests (emergency_id);
CREATE INDEX idx_help_requests_requester ON help_requests (requester_id);
CREATE INDEX idx_help_requests_status    ON help_requests (status);
CREATE INDEX idx_help_requests_priority  ON help_requests (priority);
CREATE INDEX idx_help_requests_type      ON help_requests (type);
CREATE INDEX idx_help_requests_location  ON help_requests USING GIST (location);

-- Help Offers
CREATE TABLE help_offers (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_id       UUID NOT NULL REFERENCES emergencies (id) ON DELETE CASCADE,
  volunteer_id       UUID NOT NULL REFERENCES users (id),
  type               help_request_type NOT NULL,
  status             help_offer_status NOT NULL DEFAULT 'AVAILABLE',
  description        TEXT NOT NULL,
  location           GEOGRAPHY(POINT, 4326),
  latitude           DOUBLE PRECISION,
  longitude          DOUBLE PRECISION,
  capacity           INTEGER NOT NULL DEFAULT 1,
  matched_request_id UUID REFERENCES help_requests (id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_help_offers_emergency  ON help_offers (emergency_id);
CREATE INDEX idx_help_offers_volunteer  ON help_offers (volunteer_id);
CREATE INDEX idx_help_offers_status     ON help_offers (status);
CREATE INDEX idx_help_offers_type       ON help_offers (type);
CREATE INDEX idx_help_offers_location   ON help_offers USING GIST (location);

-- Map Pins
CREATE TABLE map_pins (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities (id) ON DELETE CASCADE,
  emergency_id UUID REFERENCES emergencies (id) ON DELETE CASCADE,
  created_by   UUID REFERENCES users (id) ON DELETE SET NULL,
  type         map_pin_type NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  location     GEOGRAPHY(POINT, 4326),
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  data         JSONB NOT NULL DEFAULT '{}',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_map_pins_community  ON map_pins (community_id);
CREATE INDEX idx_map_pins_emergency  ON map_pins (emergency_id);
CREATE INDEX idx_map_pins_created_by ON map_pins (created_by);
CREATE INDEX idx_map_pins_type       ON map_pins (type);
CREATE INDEX idx_map_pins_active     ON map_pins (is_active);
CREATE INDEX idx_map_pins_location   ON map_pins USING GIST (location);

-- Seed: Athens Central community
INSERT INTO communities (name, description, latitude, longitude, radius_km, country, region)
VALUES ('Athens Central', 'Central Athens emergency response community', 37.9838, 23.7275, 5.00, 'GR', 'Attica');
