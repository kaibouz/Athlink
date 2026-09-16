/**
 * Canonical visitor → platform flow (see docs/IA.md).
 *
 * PDF-aligned: HQ Launch → one Get Started → /get-started (Choose your side)
 * → role LP → join → /app → athlete Home or coach Today.
 * Detailed How it works lives on HQ (`/#how-it-works`); role LPs keep audience sections.
 * Never dump signed-in members back onto HQ or the role gateway.
 */
export const MARKET_TO_PLATFORM = {
  /** Brand HQ */
  hq: "/",
  /** Public inventory — no login wall */
  browse: "/search",
  /** Role fork after HQ */
  getStarted: "/get-started",
  /** Role marketing LPs */
  forAthletes: "/for-athletes",
  forCoaches: "/for-coaches",
  /** Legacy URL — redirects to HQ; prefer `/#how-it-works` for in-page anchors. */
  howItWorks: "/how-it-works",
  /** Role onboarding wizards */
  joinAthlete: "/join/athlete",
  joinCoach: "/join/coach",
  /** Auth */
  signIn: "/sign-in",
  signUp: "/sign-up",
  /** Post-auth router (never marketing HQ) */
  appEntry: "/app",
  /** Role homes inside the platform */
  athleteHome: "/home",
  coachHome: "/coach/dashboard",
  adminHome: "/admin",
  /** Free vs Pro comparison + demo plan switcher */
  pricing: "/pricing",
} as const;

export type MarketToPlatformPath =
  (typeof MARKET_TO_PLATFORM)[keyof typeof MARKET_TO_PLATFORM];

/** Clerk / legacy sign-in with return into the app entry router. */
export function signInHref(redirectPath: string = MARKET_TO_PLATFORM.appEntry): string {
  const q = new URLSearchParams({ redirect_url: redirectPath });
  return `${MARKET_TO_PLATFORM.signIn}?${q.toString()}`;
}

/** Paths that belong to the marketing layer (no app chrome). */
export function isMarketingPath(pathname: string): boolean {
  const p = pathname.split(/[?#]/)[0] || "/";
  if (p === "/" || p === MARKET_TO_PLATFORM.getStarted) return true;
  if (p === MARKET_TO_PLATFORM.forAthletes || p === MARKET_TO_PLATFORM.forCoaches) return true;
  if (p === MARKET_TO_PLATFORM.howItWorks) return true;
  return false;
}

/**
 * Signed-in member surfaces. Guests (e.g. after logout) should leave these
 * and return to the marketplace HQ instead of an empty app shell.
 */
export function isMemberOnlyPath(pathname: string): boolean {
  const p = pathname.split(/[?#]/)[0] || "/";
  if (p === "/home" || p.startsWith("/home/")) return true;
  if (p === "/me" || p.startsWith("/me/")) return true;
  if (p.startsWith("/bookings") || p.startsWith("/messages") || p.startsWith("/progress")) return true;
  if (p.startsWith("/breakdown")) return true;
  // Coach app surfaces — keep public registration/marketing out of the wall.
  if (p.startsWith("/coach/") && p !== "/coach/register" && !p.startsWith("/coach/register/")) {
    return true;
  }
  if (p.startsWith("/feed/compose") || p === "/app") return true;
  return false;
}

/** Auth / join funnel between marketing and platform. */
export function isAuthFunnelPath(pathname: string): boolean {
  const p = pathname.split(/[?#]/)[0] || "/";
  if (p.startsWith("/join")) return true;
  if (p.startsWith("/sign-in") || p.startsWith("/sign-up")) return true;
  if (p === "/login" || p === "/signup" || p === "/onboarding") return true;
  return false;
}
