-- AthLink PostgreSQL DDL
-- Generated from src/db/schema.ts (Drizzle ORM)
-- Apply via: npm run db:push  (preferred) or psql -f docs/schema.sql
--
-- Current tables: 18
-- Future tables (commented): ai_breakdown_jobs, reported_posts, reported_threads

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'parent', 'executive');

CREATE TYPE lesson_format AS ENUM ('in_person', 'online');

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

CREATE TYPE package_type AS ENUM ('single', 'pack', 'subscription');

CREATE TYPE social_post_type AS ENUM ('form', 'practice', 'game', 'training', 'highlight');

-- =============================================================================
-- CORE AUTH
-- =============================================================================

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          user_role NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);

-- =============================================================================
-- COACH MARKETPLACE
-- =============================================================================

CREATE TABLE coach_profiles (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  sport             TEXT NOT NULL,
  specialties       JSONB NOT NULL,
  bio               JSONB NOT NULL,
  location          TEXT NOT NULL,
  city              TEXT NOT NULL,
  prefecture        TEXT NOT NULL,
  experience_years  INTEGER NOT NULL,
  price_per_hour    REAL NOT NULL,
  rating            REAL NOT NULL,
  review_count      INTEGER NOT NULL,
  verified          BOOLEAN NOT NULL DEFAULT false,
  formats           JSONB NOT NULL,
  avatar_url        TEXT NOT NULL,
  cover_gradient    TEXT NOT NULL,
  career            JSONB NOT NULL,
  languages         JSONB NOT NULL,
  availability_note TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX coach_profiles_user_id_idx ON coach_profiles (user_id);

CREATE TABLE reviews (
  id            TEXT PRIMARY KEY,
  coach_id      TEXT NOT NULL REFERENCES coach_profiles (id) ON DELETE CASCADE,
  author_name   TEXT NOT NULL,
  rating        REAL NOT NULL,
  comment       JSONB NOT NULL,
  date          TEXT NOT NULL,
  athlete_level TEXT NOT NULL
);

CREATE INDEX reviews_coach_id_idx ON reviews (coach_id);

CREATE TABLE time_slots (
  id         TEXT PRIMARY KEY,
  coach_id   TEXT NOT NULL REFERENCES coach_profiles (id) ON DELETE CASCADE,
  date       TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time   TEXT NOT NULL,
  available  BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX time_slots_coach_id_idx ON time_slots (coach_id);
CREATE INDEX time_slots_coach_date_idx ON time_slots (coach_id, date);

CREATE TABLE bookings (
  id           TEXT PRIMARY KEY,
  coach_id     TEXT NOT NULL REFERENCES coach_profiles (id),
  coach_name   TEXT NOT NULL,
  athlete_id   TEXT NOT NULL REFERENCES users (id),
  athlete_name TEXT NOT NULL,
  date         TEXT NOT NULL,
  start_time   TEXT NOT NULL,
  end_time     TEXT NOT NULL,
  format       lesson_format NOT NULL,
  package_type package_type NOT NULL,
  price        REAL NOT NULL,
  status       booking_status NOT NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL
);

CREATE INDEX bookings_coach_id_idx ON bookings (coach_id);
CREATE INDEX bookings_athlete_id_idx ON bookings (athlete_id);
CREATE INDEX bookings_status_idx ON bookings (status);
CREATE INDEX bookings_date_idx ON bookings (date);

-- =============================================================================
-- MESSAGING
-- =============================================================================

CREATE TABLE message_threads (
  id           TEXT PRIMARY KEY,
  coach_id     TEXT NOT NULL REFERENCES coach_profiles (id) ON DELETE CASCADE,
  coach_name   TEXT NOT NULL,
  athlete_id   TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  athlete_name TEXT NOT NULL,
  last_message JSONB NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL,
  unread       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX message_threads_coach_id_idx ON message_threads (coach_id);
CREATE INDEX message_threads_athlete_id_idx ON message_threads (athlete_id);
CREATE UNIQUE INDEX message_threads_coach_athlete_uidx ON message_threads (coach_id, athlete_id);

CREATE TABLE messages (
  id              TEXT PRIMARY KEY,
  thread_id       TEXT NOT NULL REFERENCES message_threads (id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL REFERENCES users (id),
  sender_name     TEXT NOT NULL,
  sender_name_key TEXT,
  body            JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL
);

CREATE INDEX messages_thread_id_idx ON messages (thread_id);
CREATE INDEX messages_sender_id_idx ON messages (sender_id);
CREATE INDEX messages_created_at_idx ON messages (created_at);

-- =============================================================================
-- ATHLETE / SOCIAL
-- =============================================================================

CREATE TABLE athlete_profiles (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  school            TEXT NOT NULL,
  class_year        TEXT NOT NULL,
  height            TEXT NOT NULL,
  weight            TEXT NOT NULL,
  position          TEXT NOT NULL,
  bats_throws       TEXT NOT NULL,
  location          TEXT NOT NULL,
  bio               TEXT NOT NULL,
  avatar_url        TEXT NOT NULL,
  season_stats      JSONB NOT NULL,
  looking_for_coach BOOLEAN NOT NULL DEFAULT false,
  open_to_scouts    BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX athlete_profiles_user_id_idx ON athlete_profiles (user_id);

CREATE TABLE social_posts (
  id           TEXT PRIMARY KEY,
  athlete_id   TEXT NOT NULL REFERENCES athlete_profiles (id) ON DELETE CASCADE,
  athlete_name TEXT NOT NULL,
  school       TEXT NOT NULL,
  position     TEXT NOT NULL,
  class_year   TEXT NOT NULL,
  avatar_url   TEXT NOT NULL,
  type         social_post_type NOT NULL,
  caption      TEXT NOT NULL,
  video_url    TEXT NOT NULL,
  poster_url   TEXT NOT NULL,
  stats_note   TEXT,
  created_at   TIMESTAMPTZ NOT NULL,
  likes        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX social_posts_athlete_id_idx ON social_posts (athlete_id);
CREATE INDEX social_posts_created_at_idx ON social_posts (created_at DESC);

-- =============================================================================
-- COACH TOOLS (STUDENTS / FEEDBACK)
-- =============================================================================

CREATE TABLE student_athletes (
  id                TEXT PRIMARY KEY,
  coach_id          TEXT NOT NULL REFERENCES coach_profiles (id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  age               INTEGER NOT NULL,
  level             TEXT NOT NULL,
  position          TEXT NOT NULL,
  parent_name       TEXT,
  location          TEXT NOT NULL,
  avatar_url        TEXT NOT NULL,
  lessons_completed INTEGER NOT NULL,
  next_lesson       TEXT,
  focus_areas       JSONB NOT NULL,
  ai_summary        TEXT NOT NULL,
  strengths         JSONB NOT NULL,
  improvements      JSONB NOT NULL,
  metrics           JSONB NOT NULL,
  history           JSONB NOT NULL,
  last_session_note TEXT NOT NULL,
  lesson_log        JSONB NOT NULL
);

CREATE INDEX student_athletes_coach_id_idx ON student_athletes (coach_id);

CREATE TABLE coach_feedback (
  id           TEXT PRIMARY KEY,
  coach_id     TEXT NOT NULL REFERENCES coach_profiles (id) ON DELETE CASCADE,
  student_id   TEXT NOT NULL REFERENCES student_athletes (id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL,
  ai_attached  BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX coach_feedback_coach_id_idx ON coach_feedback (coach_id);
CREATE INDEX coach_feedback_student_id_idx ON coach_feedback (student_id);

-- =============================================================================
-- ANALYTICS
-- =============================================================================

CREATE TABLE analytics_events (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  user_id    TEXT,
  coach_id   TEXT,
  path       TEXT,
  props      JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_name_idx ON analytics_events (name);
CREATE INDEX analytics_events_created_at_idx ON analytics_events (created_at DESC);
CREATE INDEX analytics_events_user_id_idx ON analytics_events (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX analytics_events_coach_id_idx ON analytics_events (coach_id) WHERE coach_id IS NOT NULL;

-- =============================================================================
-- ADMIN / PLATFORM
-- =============================================================================

CREATE TABLE admin_audit_log (
  id            TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL REFERENCES users (id),
  action        TEXT NOT NULL,
  target_type   TEXT,
  target_id     TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX admin_audit_log_admin_user_id_idx ON admin_audit_log (admin_user_id);
CREATE INDEX admin_audit_log_created_at_idx ON admin_audit_log (created_at DESC);
CREATE INDEX admin_audit_log_action_idx ON admin_audit_log (action);

CREATE TABLE feature_flags (
  key              TEXT PRIMARY KEY,
  enabled          BOOLEAN NOT NULL DEFAULT false,
  rollout_percent  INTEGER NOT NULL DEFAULT 100,
  audience         TEXT NOT NULL DEFAULT 'all',
  audience_ids     JSONB,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_alerts (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL,
  title      TEXT NOT NULL,
  detail     TEXT,
  severity   TEXT NOT NULL DEFAULT 'info',
  resolved   BOOLEAN NOT NULL DEFAULT false,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX admin_alerts_resolved_idx ON admin_alerts (resolved) WHERE resolved = false;
CREATE INDEX admin_alerts_created_at_idx ON admin_alerts (created_at DESC);

CREATE TABLE coach_applications (
  id               TEXT PRIMARY KEY,
  external_id      TEXT,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  area             TEXT NOT NULL,
  specialty        TEXT NOT NULL,
  years_experience INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending',
  documents        JSONB,
  notes            TEXT,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      TEXT REFERENCES users (id)
);

CREATE INDEX coach_applications_status_idx ON coach_applications (status);
CREATE INDEX coach_applications_submitted_at_idx ON coach_applications (submitted_at DESC);

CREATE TABLE platform_config (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT REFERENCES users (id)
);

-- =============================================================================
-- FUTURE: AI breakdown pipeline (/admin/ai placeholder)
-- Not in Drizzle schema yet — uncomment when video → analysis queue ships
-- =============================================================================

-- CREATE TYPE ai_breakdown_status AS ENUM ('queued', 'processing', 'completed', 'failed');

-- CREATE TABLE ai_breakdown_jobs ( -- FUTURE
--   id              TEXT PRIMARY KEY,
--   athlete_id      TEXT REFERENCES athlete_profiles (id) ON DELETE SET NULL,
--   coach_id        TEXT REFERENCES coach_profiles (id) ON DELETE SET NULL,
--   social_post_id  TEXT REFERENCES social_posts (id) ON DELETE SET NULL,
--   video_url       TEXT NOT NULL,
--   status          ai_breakdown_status NOT NULL DEFAULT 'queued',
--   result          JSONB,
--   error_message   TEXT,
--   cost_cents      INTEGER,
--   retry_count     INTEGER NOT NULL DEFAULT 0,
--   created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
--   started_at      TIMESTAMPTZ,
--   completed_at    TIMESTAMPTZ
-- );

-- CREATE INDEX ai_breakdown_jobs_status_idx ON ai_breakdown_jobs (status); -- FUTURE

-- =============================================================================
-- FUTURE: Content moderation (/admin/moderation placeholder)
-- Not in Drizzle schema yet — uncomment when user reporting ships
-- =============================================================================

-- CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');

-- CREATE TABLE reported_posts ( -- FUTURE
--   id              TEXT PRIMARY KEY,
--   post_id         TEXT NOT NULL REFERENCES social_posts (id) ON DELETE CASCADE,
--   reporter_id     TEXT NOT NULL REFERENCES users (id),
--   reason          TEXT NOT NULL,
--   detail          TEXT,
--   status          report_status NOT NULL DEFAULT 'open',
--   resolved_by     TEXT REFERENCES users (id),
--   resolved_at     TIMESTAMPTZ,
--   created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE TABLE reported_threads ( -- FUTURE
--   id              TEXT PRIMARY KEY,
--   thread_id       TEXT NOT NULL REFERENCES message_threads (id) ON DELETE CASCADE,
--   reporter_id     TEXT NOT NULL REFERENCES users (id),
--   reason          TEXT NOT NULL,
--   detail          TEXT,
--   status          report_status NOT NULL DEFAULT 'open',
--   resolved_by     TEXT REFERENCES users (id),
--   resolved_at     TIMESTAMPTZ,
--   created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
-- );
