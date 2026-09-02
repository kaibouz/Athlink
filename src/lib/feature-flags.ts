"use client";

import { useEffect, useState } from "react";

const DEFAULT_FLAGS: Record<string, boolean> = {
  booking_flow: true,
  training_feed: true,
  ai_breakdown: false,
  athlete_coach_messaging: true,
  scout_discovery: true,
  homepage_gateway: true,
};

let cache: Record<string, boolean> | null = null;

export function useFeatureFlag(key: string): boolean {
  const [enabled, setEnabled] = useState(cache?.[key] ?? DEFAULT_FLAGS[key] ?? false);

  useEffect(() => {
    if (cache) {
      queueMicrotask(() => setEnabled(cache![key] ?? DEFAULT_FLAGS[key] ?? false));
      return;
    }
    void fetch("/api/feature-flags")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { flags?: Record<string, boolean> } | null) => {
        cache = data?.flags ?? DEFAULT_FLAGS;
        setEnabled(cache[key] ?? false);
      })
      .catch(() => setEnabled(DEFAULT_FLAGS[key] ?? false));
  }, [key]);

  return enabled;
}
