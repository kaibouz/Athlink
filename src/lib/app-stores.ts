/**
 * Native app store links.
 *
 * The apps are not published yet, so these stay empty until the listings exist.
 * Set them in the environment rather than hardcoding a guessed URL — an app
 * store link that 404s is worse than an honest "coming soon".
 *
 *   NEXT_PUBLIC_IOS_APP_URL=https://apps.apple.com/app/id...
 *   NEXT_PUBLIC_ANDROID_APP_URL=https://play.google.com/store/apps/details?id=...
 */
export const IOS_APP_URL = process.env.NEXT_PUBLIC_IOS_APP_URL?.trim() || "";
export const ANDROID_APP_URL = process.env.NEXT_PUBLIC_ANDROID_APP_URL?.trim() || "";

export type MobilePlatform = "ios" | "android" | "other";

export function hasAnyStoreLink(): boolean {
  return Boolean(IOS_APP_URL || ANDROID_APP_URL);
}

/** Which store to send this visitor to. Client-only; returns "other" on the server. */
export function detectPlatform(): MobilePlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as Macintosh, so check for touch as well.
  const isIos =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof document !== "undefined" && navigator.maxTouchPoints > 1);
  if (isIos) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/** The single best store URL for this visitor, or "" when nothing is published. */
export function storeUrlFor(platform: MobilePlatform): string {
  if (platform === "ios") return IOS_APP_URL || ANDROID_APP_URL;
  if (platform === "android") return ANDROID_APP_URL || IOS_APP_URL;
  return IOS_APP_URL || ANDROID_APP_URL;
}
