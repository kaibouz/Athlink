/**
 * One intro per session, whichever door the visitor came through.
 *
 * `LandingSplash` (HQ video) and `SitePageTransition` (logo curtain) are two
 * halves of the same first impression, so they share one seen-flag. Both legacy
 * keys are read and written so a session that started on either component is
 * still recognised.
 */

const INTRO_KEY = "athlink_intro_seen_v2";
const ENTRY_KEY = "athlink_site_entry_v1";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(INTRO_KEY) === "1" ||
      sessionStorage.getItem(ENTRY_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
    sessionStorage.setItem(ENTRY_KEY, "1");
  } catch {
    /* ignore */
  }
}
