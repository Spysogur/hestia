CREATE TYPE map_pin_type AS ENUM (
  'RESOURCE', 'SHELTER', 'DANGER', 'MEETING_POINT', 'MEDICAL', 'DISTRIBUTION', 'OTHER'
);

CREATE TABLE map_pins (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities (id) ON DELETE CASCADE,
  emergency_id UUID REFERENCES emergencies (id) ON DELETE CASCADE,
  created_by   UUID REFERENCES users (id) ON DELETE SET NULL,
  type         map_pin_type NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  location     GEOGRAPHY(POINT, 4326) NOT NULL,
  data         JSONB NOT NULL DEFAULT '{}',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_map_pins_community ON map_pins (community_id);
CREATE INDEX idx_map_pins_emergency ON map_pins (emergency_id);
CREATE INDEX idx_map_pins_created_by ON map_pins (created_by);
CREATE INDEX idx_map_pins_type      ON map_pins (type);
CREATE INDEX idx_map_pins_active    ON map_pins (is_active);
CREATE INDEX idx_map_pins_location  ON map_pins USING GIST (location);
