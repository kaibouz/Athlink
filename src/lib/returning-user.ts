import { MARKET_TO_PLATFORM } from "@/lib/market-to-platform";
import type { UserRole } from "@/types";

const STORAGE_KEY = "athlink_returning_user_v1";

export type ReturningUserProfile = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  /** One-click destination after return (My Page). */
  myPageHref: string;
  /** Prefer WebAuthn / platform biometric when available. */
  preferPasskey: boolean;
  updatedAt: string;
};

export function myPageHrefForRole(role: UserRole): string {
  if (role === "executive") return MARKET_TO_PLATFORM.adminHome;
  // Shared account hub; role dashboards remain one hop away from /me.
  return "/me";
}

export function readReturningUser(): ReturningUserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReturningUserProfile;
    if (!parsed?.userId || !parsed?.myPageHref) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function rememberReturningUser(
  input: Omit<ReturningUserProfile, "updatedAt" | "preferPasskey" | "myPageHref"> & {
    preferPasskey?: boolean;
    myPageHref?: string;
  },
): ReturningUserProfile {
  const prev = readReturningUser();
  const next: ReturningUserProfile = {
    userId: input.userId,
    name: input.name,
    email: input.email,
    role: input.role,
    avatarUrl: input.avatarUrl,
    myPageHref: input.myPageHref ?? myPageHrefForRole(input.role),
    preferPasskey: input.preferPasskey ?? prev?.preferPasskey ?? false,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
  return next;
}

export function markPasskeyPreferred(preferred = true) {
  const prev = readReturningUser();
  if (!prev) return;
  rememberReturningUser({ ...prev, preferPasskey: preferred });
}

export function clearReturningUser() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** True when this browser can offer platform biometrics via WebAuthn. */
export async function supportsPlatformAuthenticator(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (typeof window.PublicKeyCredential === "undefined") return false;
  try {
    const uvpa = (
      PublicKeyCredential as typeof PublicKeyCredential & {
        isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
      }
    ).isUserVerifyingPlatformAuthenticatorAvailable;
    if (typeof uvpa === "function") {
      return await uvpa.call(PublicKeyCredential);
    }
  } catch {
    /* fall through */
  }
  return true;
}

/* ------------------------------------------------------------------------ */
/*  "Save login info on this device"                                        */
/* ------------------------------------------------------------------------ */

const SAVE_LOGIN_KEY = "athlink_save_login_v1";
const PASSKEY_PROMPT_DISMISSED_KEY = "athlink_passkey_prompt_dismissed_v1";

/**
 * The checkbox on the sign-in page. On by default — most people sign in on
 * their own phone or laptop — but it is offered precisely so a shared device
 * can opt out and leave nothing behind.
 */
export function readSaveLoginPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(SAVE_LOGIN_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setSaveLoginPreference(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVE_LOGIN_KEY, on ? "1" : "0");
  } catch {
    /* private mode */
  }
  if (!on) clearReturningUser();
}

export function isPasskeyPromptDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(PASSKEY_PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return true;
  }
}

export function dismissPasskeyPrompt() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PASSKEY_PROMPT_DISMISSED_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Whether this Clerk instance accepts passkeys at all (Dashboard → User &
 * authentication → Passkeys). Until it does, offering Touch ID / Face ID only
 * produces a failed prompt, so the UI stays quiet.
 *
 * Clerk does not expose instance settings publicly; this reads the environment
 * clerk-js already loaded. If that shape ever changes we fall back to "unknown"
 * and let the enrol attempt report its own error.
 */
export function clerkPasskeysEnabled(): boolean | null {
  if (typeof window === "undefined") return null;
  type Env = { userSettings?: { attributes?: { passkey?: { enabled?: boolean } } } };
  const c = (window as unknown as {
    Clerk?: { environment?: Env; __internal_environment?: Env; __unstable__environment?: Env };
  }).Clerk;
  // clerk-js has renamed this across majors (v6: environment / __internal_environment).
  const env = c?.environment ?? c?.__internal_environment ?? c?.__unstable__environment;
  const enabled = env?.userSettings?.attributes?.passkey?.enabled;
  return typeof enabled === "boolean" ? enabled : null;
}
