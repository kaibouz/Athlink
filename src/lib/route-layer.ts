/**
 * Single source of truth for which product layer a route belongs to.
 *
 * AthlinkPro is two products behind one domain: a marketing site that sells the
 * company, and the platform coaches and athletes actually work in. Chrome
 * (`AppShell`), the mobile tab bar (`MobileNav`) and the entry/route motion
 * (`SitePageTransition`) all need the same answer, so they all ask here.
 */

export type RouteLayer =
  /** Public site that sells AthlinkPro. */
  | "marketing"
  /** Sign-in / sign-up / join funnel between the two products. */
  | "auth"
  /** The coach + athlete product. */
  | "platform"
  /** Internal operator console. */
  | "admin"
  /** Internal tooling and previews that belong to neither product. */
  | "utility";

const MARKETING_ROUTES = new Set([
  "/",
  "/for-athletes",
  "/for-coaches",
  "/get-started",
]);

/** `/dns` is an operator DNS helper, `/ios` a desktop device-frame preview. */
const UTILITY_ROUTES = new Set(["/dns", "/ios"]);

/** Legacy in-house credential forms (Clerk pages live under /sign-in, /sign-up). */
const CREDENTIAL_FORM_ROUTES = new Set(["/login", "/signup"]);

const CLERK_AUTH_PREFIXES = ["/sign-in", "/sign-up"];

/** Role gateway + onboarding wizard. `/onboarding` is a legacy alias of `/join`. */
const JOIN_PREFIXES = ["/join", "/onboarding"];

const ADMIN_PREFIX = "/admin";

/** `usePathname()` is already clean, but be defensive about trailing slashes. */
function normalize(pathname: string): string {
  const path = pathname.split(/[?#]/)[0];
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

function underPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Clerk-hosted sign-in / sign-up, including catch-all children like /sign-in/sso-callback. */
export function isClerkAuthRoute(pathname: string): boolean {
  const path = normalize(pathname);
  return CLERK_AUTH_PREFIXES.some((prefix) => underPrefix(path, prefix));
}

export function isCredentialFormRoute(pathname: string): boolean {
  return CREDENTIAL_FORM_ROUTES.has(normalize(pathname));
}

/** The role gateway and the onboarding wizard, which render their own chrome. */
export function isJoinRoute(pathname: string): boolean {
  const path = normalize(pathname);
  return JOIN_PREFIXES.some((prefix) => underPrefix(path, prefix));
}

export function isAdminRoute(pathname: string): boolean {
  return underPrefix(normalize(pathname), ADMIN_PREFIX);
}

/** The HQ landing page, which plays the video intro instead of the curtain. */
export function isHqRoute(pathname: string): boolean {
  return normalize(pathname) === "/";
}

export function layerFor(pathname: string): RouteLayer {
  const path = normalize(pathname);
  if (underPrefix(path, ADMIN_PREFIX)) return "admin";
  if (MARKETING_ROUTES.has(path)) return "marketing";
  if (UTILITY_ROUTES.has(path)) return "utility";
  if (
    CREDENTIAL_FORM_ROUTES.has(path) ||
    isClerkAuthRoute(path) ||
    isJoinRoute(path)
  ) {
    return "auth";
  }
  return "platform";
}

/** The in-product tab bar belongs to the platform only. */
export function showsAppTabBar(pathname: string): boolean {
  return layerFor(pathname) === "platform";
}

/**
 * The AthlinkPro logo curtain is consumer branding: HQ plays the video intro
 * instead, and internal surfaces (admin console, operator tools) get neither.
 */
export function showsEntryCurtain(pathname: string): boolean {
  if (isHqRoute(pathname)) return false;
  const layer = layerFor(pathname);
  return layer !== "admin" && layer !== "utility";
}

/**
 * Marketing and the auth funnel keep the cinematic route fade; inside the
 * product (and the console) navigation should feel like an app, not a film.
 */
export function routeEnterClass(pathname: string): string {
  const layer = layerFor(pathname);
  return layer === "marketing" || layer === "auth"
    ? "site-route-enter"
    : "site-route-enter-app";
}
