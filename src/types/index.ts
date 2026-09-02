import type { Localized } from "@/lib/i18n/localize";

export type UserRole = "athlete" | "coach" | "parent" | "executive";
export type LessonFormat = "in_person" | "online";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PackageType = "single" | "pack" | "subscription";
export type { Localized };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface CoachProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  sport: string;
  specialties: string[];
  bio: Localized;
  location: string;
  city: string;
  prefecture: string;
  experienceYears: number;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  formats: LessonFormat[];
  avatarUrl: string;
  coverGradient: string;
  career: Localized[];
  languages: string[];
  availabilityNote: string;
}

export interface Review {
  id: string;
  coachId: string;
  authorName: string;
  rating: number;
  comment: Localized;
  date: string;
  athleteLevel: string;
}

export interface TimeSlot {
  id: string;
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Booking {
  id: string;
  coachId: string;
  coachName: string;
  athleteId: string;
  athleteName: string;
  date: string;
  startTime: string;
  endTime: string;
  format: LessonFormat;
  packageType: PackageType;
  price: number;
  status: BookingStatus;
  note?: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  coachId: string;
  coachName: string;
  athleteId: string;
  athleteName: string;
  lastMessage: Localized;
  updatedAt: string;
  unread: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  /** Demo seed may be Localized; user-typed messages are plain strings */
  senderNameKey?: "you";
  body: Localized | string;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  sport: string;
  location: string;
  specialty: string;
  language: string;
  format: "" | LessonFormat;
  minPrice: number;
  maxPrice: number;
  verifiedOnly: boolean;
  sortBy: "rating" | "price_asc" | "price_desc" | "reviews";
}

export interface AiMetricPoint {
  date: string;
  batSpeed: number;
  attackAngle: number;
  hipRotation: number;
  exitVelo: number;
}

export interface LessonLogEntry {
  id: string;
  date: string;
  focus: string;
  notes: string;
  durationMin: number;
}

export interface StudentAthlete {
  id: string;
  name: string;
  age: number;
  level: string;
  position: string;
  parentName?: string;
  location: string;
  avatarUrl: string;
  lessonsCompleted: number;
  nextLesson?: string;
  focusAreas: string[];
  aiSummary: string;
  strengths: string[];
  improvements: string[];
  metrics: {
    batSpeed: number;
    attackAngle: number;
    hipRotation: number;
    exitVelo: number;
    consistency: number;
  };
  history: AiMetricPoint[];
  lastSessionNote: string;
  /** Coach-kept lesson log with this athlete */
  lessonLog: LessonLogEntry[];
}

export interface CoachFeedback {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  body: string;
  createdAt: string;
  aiAttached: boolean;
}

export type SocialPostType = "form" | "practice" | "game" | "training" | "highlight";

export interface SeasonStats {
  avg?: string;
  obp?: string;
  slg?: string;
  hr?: number;
  rbi?: number;
  era?: string;
  wins?: number;
  strikeouts?: number;
  games?: number;
  seasonLabel: string;
}

export interface AthletePublicProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  school: string;
  classYear: string;
  height: string;
  weight: string;
  position: string;
  batsThrows: string;
  location: string;
  bio: string;
  avatarUrl: string;
  seasonStats: SeasonStats;
  lookingForCoach: boolean;
  openToScouts: boolean;
}

export interface SocialPost {
  id: string;
  athleteId: string;
  athleteName: string;
  school: string;
  position: string;
  classYear: string;
  avatarUrl: string;
  type: SocialPostType;
  caption: string;
  videoUrl: string;
  posterUrl: string;
  statsNote?: string;
  createdAt: string;
  likes: number;
}
