CREATE TYPE emergency_type AS ENUM (
  'WILDFIRE', 'EARTHQUAKE', 'FLOOD', 'STORM', 'TSUNAMI', 'LANDSLIDE', 'HEATWAVE', 'OTHER'
);
CREATE TYPE emergency_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE emergency_status AS ENUM ('ACTIVE', 'MONITORING', 'RESOLVED', 'CANCELLED');

CREATE TABLE emergencies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities (id) ON DELETE CASCADE,
  type         emergency_type NOT NULL,
  severity     emergency_severity NOT NULL,
  status       emergency_status NOT NULL DEFAULT 'ACTIVE',
  title        VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  location     GEOGRAPHY(POINT, 4326) NOT NULL,
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
