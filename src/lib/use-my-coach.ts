"use client";

import { useEffect, useState } from "react";
import type { CoachProfile } from "@/types";
import { useAuth } from "@/lib/store";

export function useMyCoach() {
  const { user, hydrated } = useAuth();
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "coach") {
      setCoach(null);
      setHasProfile(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void fetch("/api/coaches/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { coach: CoachProfile | null }) => {
        if (cancelled) return;
        setCoach(data.coach);
        setHasProfile(Boolean(data.coach));
      })
      .catch(() => {
        if (!cancelled) {
          setCoach(null);
          setHasProfile(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  return { coach, loading, hasProfile };
}
