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
