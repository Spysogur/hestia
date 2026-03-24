CREATE TYPE help_request_type AS ENUM (
  'EVACUATION', 'MEDICAL', 'SHELTER', 'SUPPLIES', 'TRANSPORT', 'RESCUE', 'INFORMATION', 'OTHER'
);
CREATE TYPE help_request_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE help_request_status AS ENUM ('OPEN', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE help_requests (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_id         UUID NOT NULL REFERENCES emergencies (id) ON DELETE CASCADE,
  requester_id         UUID NOT NULL REFERENCES users (id),
  type                 help_request_type NOT NULL,
  priority             help_request_priority NOT NULL,
  status               help_request_status NOT NULL DEFAULT 'OPEN',
  title                VARCHAR(255) NOT NULL,
  description          TEXT NOT NULL,
  location             GEOGRAPHY(POINT, 4326) NOT NULL,
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
