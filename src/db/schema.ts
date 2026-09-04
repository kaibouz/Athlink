import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["athlete", "coach", "parent", "executive"]);
export const lessonFormatEnum = pgEnum("lesson_format", ["in_person", "online"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);
export const packageTypeEnum = pgEnum("package_type", ["single", "pack", "subscription"]);
export const socialPostTypeEnum = pgEnum("social_post_type", [
  "form",
  "practice",
  "game",
  "training",
  "highlight",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  /** Clerk user id for public members. NULL for admin/executive rows, which stay password-only. */
  clerkId: text("clerk_id").unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const coachProfiles = pgTable("coach_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  sport: text("sport").notNull(),
  specialties: jsonb("specialties").$type<string[]>().notNull(),
  bio: jsonb("bio").$type<{ en: string; ja: string; es: string }>().notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  prefecture: text("prefecture").notNull(),
  experienceYears: integer("experience_years").notNull(),
  pricePerHour: real("price_per_hour").notNull(),
  rating: real("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  verified: boolean("verified").notNull().default(false),
  formats: jsonb("formats").$type<("in_person" | "online")[]>().notNull(),
  avatarUrl: text("avatar_url").notNull(),
  coverGradient: text("cover_gradient").notNull(),
  career: jsonb("career").$type<{ en: string; ja: string; es: string }[]>().notNull(),
  languages: jsonb("languages").$type<string[]>().notNull(),
  availabilityNote: text("availability_note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  coachId: text("coach_id")
    .notNull()
    .references(() => coachProfiles.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  rating: real("rating").notNull(),
  comment: jsonb("comment").$type<{ en: string; ja: string; es: string }>().notNull(),
  date: text("date").notNull(),
  athleteLevel: text("athlete_level").notNull(),
});

export const timeSlots = pgTable("time_slots", {
  id: text("id").primaryKey(),
  coachId: text("coach_id")
    .notNull()
    .references(() => coachProfiles.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  available: boolean("available").notNull().default(true),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  coachId: text("coach_id")
    .notNull()
    .references(() => coachProfiles.id),
  coachName: text("coach_name").notNull(),
  athleteId: text("athlete_id")
    .notNull()
    .references(() => users.id),
  athleteName: text("athlete_name").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  format: lessonFormatEnum("format").notNull(),
  packageType: packageTypeEnum("package_type").notNull(),
  price: real("price").notNull(),
  status: bookingStatusEnum("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const messageThreads = pgTable("message_threads", {
  id: text("id").primaryKey(),
  coachId: text("coach_id")
    .notNull()
    .references(() => coachProfiles.id, { onDelete: "cascade" }),
  coachName: text("coach_name").notNull(),
  athleteId: text("athlete_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  athleteName: text("athlete_name").notNull(),
  lastMessage: jsonb("last_message").$type<{ en: string; ja: string; es: string }>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  unread: integer("unread").notNull().default(0),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => messageThreads.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id),
  senderName: text("sender_name").notNull(),
  senderNameKey: text("sender_name_key"),
  body: jsonb("body").$type<{ en: string; ja: string; es: string } | string>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const athleteProfiles = pgTable("athlete_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  school: text("school").notNull(),
  classYear: text("class_year").notNull(),
  height: text("height").notNull(),
  weight: text("weight").notNull(),
  position: text("position").notNull(),
  batsThrows: text("bats_throws").notNull(),
  location: text("location").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  seasonStats: jsonb("season_stats").notNull(),
  lookingForCoach: boolean("looking_for_coach").notNull().default(false),
  openToScouts: boolean("open_to_scouts").notNull().default(false),
});

export const socialPosts = pgTable("social_posts", {
  id: text("id").primaryKey(),
  athleteId: text("athlete_id")
    .notNull()
    .references(() => athleteProfiles.id, { onDelete: "cascade" }),
  athleteName: text("athlete_name").notNull(),
  school: text("school").notNull(),
  position: text("position").notNull(),
  classYear: text("class_year").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  type: socialPostTypeEnum("type").notNull(),
  caption: text("caption").notNull(),
  videoUrl: text("video_url").notNull(),
  posterUrl: text("poster_url").notNull(),
  statsNote: text("stats_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  likes: integer("likes").notNull().default(0),
});

export const studentAthletes = pgTable("student_athletes", {
  id: text("id").primaryKey(),
  coachId: text("coach_id")
    .notNull()
    .references(() => coachProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  level: text("level").notNull(),
  position: text("position").notNull(),
  parentName: text("parent_name"),
  location: text("location").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  lessonsCompleted: integer("lessons_completed").notNull(),
  nextLesson: text("next_lesson"),
  focusAreas: jsonb("focus_areas").$type<string[]>().notNull(),
  aiSummary: text("ai_summary").notNull(),
  strengths: jsonb("strengths").$type<string[]>().notNull(),
  improvements: jsonb("improvements").$type<string[]>().notNull(),
  metrics: jsonb("metrics").notNull(),
  history: jsonb("history").notNull(),
  lastSessionNote: text("last_session_note").notNull(),
  lessonLog: jsonb("lesson_log").notNull(),
});

export const coachFeedback = pgTable("coach_feedback", {
  id: text("id").primaryKey(),
  coachId: text("coach_id")
    .notNull()
    .references(() => coachProfiles.id, { onDelete: "cascade" }),
  studentId: text("student_id")
    .notNull()
    .references(() => studentAthletes.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  aiAttached: boolean("ai_attached").notNull().default(false),
});

/** MVP analytics — page views, clicks, funnel events */
export const analyticsEvents = pgTable("analytics_events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id"),
  coachId: text("coach_id"),
  path: text("path"),
  props: jsonb("props").$type<Record<string, string>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Admin audit trail — every executive write action */
export const adminAuditLog = pgTable("admin_audit_log", {
  id: text("id").primaryKey(),
  adminUserId: text("admin_user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Feature flags — read by web app via useFeatureFlag */
export const featureFlags = pgTable("feature_flags", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  rolloutPercent: integer("rollout_percent").notNull().default(100),
  audience: text("audience").notNull().default("all"),
  audienceIds: jsonb("audience_ids").$type<string[]>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Platform alerts shown in admin overview */
export const adminAlerts = pgTable("admin_alerts", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  detail: text("detail"),
  severity: text("severity").notNull().default("info"),
  resolved: boolean("resolved").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Coach applications — Jotform / manual intake queue */
export const coachApplications = pgTable("coach_applications", {
  id: text("id").primaryKey(),
  externalId: text("external_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  area: text("area").notNull(),
  specialty: text("specialty").notNull(),
  yearsExperience: integer("years_experience").notNull().default(0),
  status: text("status").notNull().default("pending"),
  documents: jsonb("documents").$type<Record<string, string>>(),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by").references(() => users.id),
});

/** Editable platform config (pricing, cities, thresholds) */
export const platformConfig = pgTable("platform_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  updatedBy: text("updated_by").references(() => users.id),
});
