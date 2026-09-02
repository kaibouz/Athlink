import type { UserRole } from "@/types";

const COMPLETE_PREFIX = "athlink_onboarding_complete_";
const PENDING_KEY = "athlink_onboarding_pending";
const DRAFT_KEY = "athlink_onboarding_draft";

export type OnboardingStep =
  | "welcome"
  | "account"
  | "intro"
  | "profile"
  | "details"
  | "social"
  | "finish";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "account",
  "intro",
  "profile",
  "details",
  "social",
  "finish",
];

export interface OnboardingDraft {
  role: "coach" | "athlete";
  name: string;
  email: string;
  password: string;
  // coach profile
  sport: string;
  specialty: string;
  location: string;
  bio: string;
  price: string;
  languages: string[];
  // athlete profile
  school: string;
  classYear: string;
  position: string;
  athleteLocation: string;
  athleteBio: string;
  height: string;
  weight: string;
  batsThrows: string;
  lookingForCoach: boolean;
  openToScouts: boolean;
  // social
  postCaption: string;
  postType: "practice" | "game" | "training" | "highlight" | "form";
}

export function defaultDraft(role: "coach" | "athlete" = "athlete"): OnboardingDraft {
  return {
    role,
    name: "",
    email: "",
    password: "",
    sport: "baseball",
    specialty: "hitting",
    location: "Los Angeles, CA",
    bio: "",
    price: "80",
    languages: ["english"],
    school: "",
    classYear: "2028",
    position: "OF",
    athleteLocation: "Los Angeles, CA",
    athleteBio: "",
    height: "",
    weight: "",
    batsThrows: "R/R",
    lookingForCoach: true,
    openToScouts: true,
    postCaption: "",
    postType: "practice",
  };
}

export function isOnboardingComplete(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${COMPLETE_PREFIX}${userId}`) === "1";
}

export function markOnboardingComplete(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${COMPLETE_PREFIX}${userId}`, "1");
  sessionStorage.removeItem(PENDING_KEY);
}

export function setOnboardingPending() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_KEY, "1");
}

export function hasOnboardingPending(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PENDING_KEY) === "1";
}

export function shouldEnterOnboarding(userId: string | null): boolean {
  if (!userId) return false;
  if (isOnboardingComplete(userId)) return false;
  return hasOnboardingPending() || loadDraft() !== null;
}

export function destinationFor(role: UserRole): string {
  if (role === "executive") return "/admin";
  return role === "coach" ? "/coach/dashboard" : "/bookings";
}

/** Role-specific signup / onboarding entry (after /join gateway). */
export function joinPathFor(role: UserRole | "coach" | "athlete"): string {
  return role === "coach" ? "/join/coach" : "/join/athlete";
}

/** Wizard steps shown on /join/coach and /join/athlete (no gateway pick). */
export const ONBOARDING_WIZARD_STEPS: OnboardingStep[] = [
  "account",
  "intro",
  "profile",
  "details",
  "social",
  "finish",
];

export function loadDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}

export function stepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

export function stepProgress(step: OnboardingStep): number {
  const idx = stepIndex(step);
  if (idx <= 0) return 0;
  return Math.round((idx / (ONBOARDING_STEPS.length - 1)) * 100);
}
