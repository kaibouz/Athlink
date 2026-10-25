"use client";

import { useEffect, useState } from "react";
import type { CoachProfile, User } from "@/types";
import { useAuth } from "@/lib/store";

type FetchResult = { forUser: User; coach: CoachProfile | null };

export function useMyCoach() {
  const { user, hydrated } = useAuth();
  const [result, setResult] = useState<FetchResult | null>(null);

  const isCoach = hydrated && user?.role === "coach";

  useEffect(() => {
    if (!hydrated || !user || user.role !== "coach") return;

    let cancelled = false;
    void fetch("/api/coaches/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { coach: CoachProfile | null }) => {
        if (!cancelled) setResult({ forUser: user, coach: data.coach });
      })
      .catch(() => {
        if (!cancelled) setResult({ forUser: user, coach: null });
      });

    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  // Until hydrated we don't know who the user is; for coaches we're loading
  // until the fetch for the current user object has settled.
  const loading = !hydrated || (isCoach && result?.forUser !== user);
  const coach = isCoach ? (result?.coach ?? null) : null;

  return { coach, loading, hasProfile: Boolean(coach) };
}
