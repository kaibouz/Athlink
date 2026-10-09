/**
 * Canonical visitor → platform flow (see docs/IA.md).
 *
 * One main site at `/`: hero role choice → Clerk sign-up → role profile wizard
 * → /app → athlete Home or coach Today. The app walkthrough lives lower on that
 * same page, so there is no marketing detour between choosing a side and the
 * account. `/get-started`, `/join`, `/for-athletes` and `/for-coaches` are kept
 * only as redirects to `/`.
 * Never dump signed-in members back onto the main site.
 */
export const MARKET_TO_PLATFORM = {
  /** The single main site — role choice + app walkthrough */
  hq: "/",
  /** Public inventory — no login wall */
  browse: "/search",
  /** Detailed how lives on the main site (`/#how-it-works`). */
  howItWorks: "/",
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

/** Clerk sign-up that returns into a specific in-app path (role onboarding). */
export function signUpHref(redirectPath: string = MARKET_TO_PLATFORM.appEntry): string {
  const q = new URLSearchParams({ redirect_url: redirectPath });
  return `${MARKET_TO_PLATFORM.signUp}?${q.toString()}`;
}

/**
 * Only same-origin paths may come back from `?redirect_url=`. Anything else —
 * absolute URLs, protocol-relative `//evil.com` — falls back to the app entry
 * router so the auth pages can never be used as an open redirect.
 */
export function safeRedirectPath(
  value: string | string[] | undefined,
  fallback: string = MARKET_TO_PLATFORM.appEntry,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

/** Paths that belong to the marketing layer (no app chrome). */
export function isMarketingPath(pathname: string): boolean {
  const p = pathname.split(/[?#]/)[0] || "/";
  return p === MARKET_TO_PLATFORM.hq;
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
