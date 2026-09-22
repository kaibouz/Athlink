/**
 * Canonical Free vs Pro platform specs.
 * Marketing copy, Me/Pricing UI, and API gates all read from here.
 */

export type PlatformPlanId = "free" | "pro";
export type PlanAudience = "athlete" | "coach";

/** Stable feature keys used for gating and comparison tables. */
export type PlanFeatureKey =
  | "book_verified_coaches"
  | "message_thread"
  | "training_feed"
  | "session_history"
  | "ai_breakdowns"
  | "week_comparisons"
  | "full_progress_dashboard"
  | "scout_visibility"
  | "priority_booking"
  | "public_coach_profile"
  | "calendar_qr_booking"
  | "my_athletes_basic"
  | "search_priority"
  | "earnings_analytics"
  | "athlete_ai_suite"
  | "scout_discovery_tools"
  | "featured_badge";

export interface PlanLimits {
  /** null = unlimited */
  aiBreakdownsPerMonth: number | null;
}

export interface PlanSpec {
  id: PlatformPlanId;
  audience: PlanAudience;
  /** Display price in USD; 0 = free forever */
  priceUsdMonthly: number;
  limits: PlanLimits;
  included: PlanFeatureKey[];
  /** Explicit Free omissions (shown with strikethrough on marketing) */
  excluded: PlanFeatureKey[];
}

export const PLAN_COOKIE = "athlink_plan";

export const ATHLETE_FREE: PlanSpec = {
  id: "free",
  audience: "athlete",
  priceUsdMonthly: 0,
  limits: { aiBreakdownsPerMonth: 2 },
  included: [
    "book_verified_coaches",
    "message_thread",
    "training_feed",
    "session_history",
    "ai_breakdowns",
  ],
  excluded: [
    "week_comparisons",
    "full_progress_dashboard",
    "scout_visibility",
    "priority_booking",
  ],
};

export const ATHLETE_PRO: PlanSpec = {
  id: "pro",
  audience: "athlete",
  priceUsdMonthly: 29,
  limits: { aiBreakdownsPerMonth: null },
  included: [
    "book_verified_coaches",
    "message_thread",
    "training_feed",
    "session_history",
    "ai_breakdowns",
    "week_comparisons",
    "full_progress_dashboard",
    "scout_visibility",
    "priority_booking",
  ],
  excluded: [],
};

export const COACH_FREE: PlanSpec = {
  id: "free",
  audience: "coach",
  priceUsdMonthly: 0,
  limits: { aiBreakdownsPerMonth: null },
  included: [
    "public_coach_profile",
    "calendar_qr_booking",
    "message_thread",
    "my_athletes_basic",
    "session_history",
  ],
  excluded: [
    "search_priority",
    "earnings_analytics",
    "athlete_ai_suite",
    "scout_discovery_tools",
    "featured_badge",
  ],
};

export const COACH_PRO: PlanSpec = {
  id: "pro",
  audience: "coach",
  priceUsdMonthly: 29,
  limits: { aiBreakdownsPerMonth: null },
  included: [
    "public_coach_profile",
    "calendar_qr_booking",
    "message_thread",
    "my_athletes_basic",
    "session_history",
    "search_priority",
    "earnings_analytics",
    "athlete_ai_suite",
    "scout_discovery_tools",
    "featured_badge",
  ],
  excluded: [],
};

const SPECS: Record<PlanAudience, Record<PlatformPlanId, PlanSpec>> = {
  athlete: { free: ATHLETE_FREE, pro: ATHLETE_PRO },
  coach: { free: COACH_FREE, pro: COACH_PRO },
};

export function isPlatformPlanId(value: unknown): value is PlatformPlanId {
  return value === "free" || value === "pro";
}

export function resolvePlanId(value: unknown): PlatformPlanId {
  return isPlatformPlanId(value) ? value : "free";
}

export function getPlanSpec(audience: PlanAudience, plan: PlatformPlanId = "free"): PlanSpec {
  return SPECS[audience][plan];
}

export function planAudienceFromRole(role: string | undefined | null): PlanAudience {
  return role === "coach" ? "coach" : "athlete";
}

export function canUseFeature(
  audience: PlanAudience,
  plan: PlatformPlanId,
  feature: PlanFeatureKey,
): boolean {
  const spec = getPlanSpec(audience, plan);
  if (spec.included.includes(feature)) return true;
  // Free AI is included but capped — still "can use" until quota exhausted.
  return false;
}

export function isProPlan(plan: PlatformPlanId | undefined | null): boolean {
  return plan === "pro";
}

/** Month-quota check for AI breakdowns. Free athletes: 2/mo. Pro: unlimited. */
export function aiBreakdownQuota(
  audience: PlanAudience,
  plan: PlatformPlanId,
): { limit: number | null; unlimited: boolean } {
  const limit = getPlanSpec(audience, plan).limits.aiBreakdownsPerMonth;
  return { limit, unlimited: limit === null };
}

export function remainingAiBreakdowns(
  usedThisMonth: number,
  audience: PlanAudience,
  plan: PlatformPlanId,
): number | null {
  const { limit, unlimited } = aiBreakdownQuota(audience, plan);
  if (unlimited || limit === null) return null;
  return Math.max(0, limit - usedThisMonth);
}
