"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/store";

/** Storage key for the accent chosen at the gateway before an account exists. */
export const ROLE_ACCENT_KEY = "athlink_role_accent";

/**
 * Applies an app-wide role accent by setting `data-role` on <html>.
 * Token overrides for `[data-role="athlete"|"coach"]` live in mobile-concept.css,
 * so every screen (nav, buttons, gradients, chips) recolors from one place.
 */
export function RoleTheme() {
  const { user, hydrated } = useAuth();

  useEffect(() => {
    const el = document.documentElement;
    let role: string | undefined = user?.role;
    if (!role) {
      try {
        role = localStorage.getItem(ROLE_ACCENT_KEY) ?? undefined;
      } catch {
        /* ignore */
      }
    }
    if (role === "coach" || role === "athlete") {
      el.dataset.role = role;
    } else {
      delete el.dataset.role;
    }
  }, [user, hydrated]);

  return null;
}
