CREATE TYPE help_offer_status AS ENUM ('AVAILABLE', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'WITHDRAWN');

CREATE TABLE help_offers (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_id       UUID NOT NULL REFERENCES emergencies (id) ON DELETE CASCADE,
  volunteer_id       UUID NOT NULL REFERENCES users (id),
  type               help_request_type NOT NULL,
  status             help_offer_status NOT NULL DEFAULT 'AVAILABLE',
  description        TEXT NOT NULL,
  location           GEOGRAPHY(POINT, 4326) NOT NULL,
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
