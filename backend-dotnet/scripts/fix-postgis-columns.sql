-- Fix: Add separate latitude/longitude columns alongside PostGIS location
-- The .NET backend uses separate lat/lng columns while the original Node.js
-- backend used PostGIS geography(Point,4326) location columns.
-- This script adds the columns and backfills from existing PostGIS data.

-- Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Communities
ALTER TABLE communities ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Emergencies
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Help Requests
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Help Offers
ALTER TABLE help_offers ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE help_offers ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Map Pins
ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Drop NOT NULL on location columns (we now use separate lat/lng)
ALTER TABLE communities ALTER COLUMN location DROP NOT NULL;
ALTER TABLE emergencies ALTER COLUMN location DROP NOT NULL;
ALTER TABLE help_requests ALTER COLUMN location DROP NOT NULL;
ALTER TABLE help_offers ALTER COLUMN location DROP NOT NULL;
ALTER TABLE map_pins ALTER COLUMN location DROP NOT NULL;

-- Backfill from PostGIS data
UPDATE users SET latitude = ST_Y(location::geometry), longitude = ST_X(location::geometry) WHERE location IS NOT NULL AND latitude IS NULL;
UPDATE communities SET latitude = ST_Y(location::geometry), longitude = ST_X(location::geometry) WHERE location IS NOT NULL AND latitude IS NULL;
UPDATE emergencies SET latitude = ST_Y(location::geometry), longitude = ST_X(location::geometry) WHERE location IS NOT NULL AND latitude IS NULL;
UPDATE help_requests SET latitude = ST_Y(location::geometry), longitude = ST_X(location::geometry) WHERE location IS NOT NULL AND latitude IS NULL;
UPDATE help_offers SET latitude = ST_Y(location::geometry), longitude = ST_X(location::geometry) WHERE location IS NOT NULL AND latitude IS NULL;
UPDATE map_pins SET latitude = ST_Y(location::geometry), longitude = ST_X(location::geometry) WHERE location IS NOT NULL AND latitude IS NULL;
