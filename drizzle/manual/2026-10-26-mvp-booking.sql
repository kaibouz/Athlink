-- MVP booking model (additive, idempotent — safe to re-run).
-- Booking requests (declined), lesson location, coach profile fields,
-- weekly availability template, server error log.

ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'declined';

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminded_at timestamptz;

ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS positions jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS levels jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS venues jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS intro_video_url text;

CREATE TABLE IF NOT EXISTS coach_availability (
  id text PRIMARY KEY,
  coach_id text NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  weekday integer NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL
);
CREATE INDEX IF NOT EXISTS coach_availability_coach_idx ON coach_availability (coach_id);

CREATE TABLE IF NOT EXISTS error_logs (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL,
  message text NOT NULL,
  stack text,
  path text,
  user_id text
);
