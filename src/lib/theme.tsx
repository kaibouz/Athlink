"use client";

import { useEffect, type ReactNode } from "react";

/**
 * AthlinkPro is dark-only, site-wide — the market site and the platform share
 * the app's --mx-* palette, which has no light values. There is no toggle.
 *
 * The API below is kept so existing callers keep compiling; it always reports
 * "dark". A "light" value left in storage by the old toggle is cleared.
 */
export type ThemeMode = "dark";

const STORAGE_KEY = "athlink_theme";

function applyDark() {
  const root = document.documentElement;
  root.classList.add("dark");
  root.style.colorScheme = "dark";
}

export function useTheme() {
  return { theme: "dark" as const };
}

/** Kept for callers; the whole site is dark already. */
export function useForceDarkTheme() {
  useEffect(applyDark, []);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyDark();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage may be blocked */
    }
  }, []);
  return <>{children}</>;
}
