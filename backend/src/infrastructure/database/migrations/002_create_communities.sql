CREATE TABLE communities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(255) UNIQUE NOT NULL,
  description  TEXT NOT NULL,
  location     GEOGRAPHY(POINT, 4326) NOT NULL,
  radius_km    NUMERIC(10, 2) NOT NULL,
  country      VARCHAR(100) NOT NULL,
  region       VARCHAR(100) NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK: users.community_id -> communities.id
ALTER TABLE users
  ADD CONSTRAINT fk_users_community
  FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE SET NULL;

CREATE INDEX idx_communities_country  ON communities (country);
CREATE INDEX idx_communities_active   ON communities (is_active);
CREATE INDEX idx_communities_location ON communities USING GIST (location);
