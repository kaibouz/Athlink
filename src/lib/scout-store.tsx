"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OutreachKind = "contact" | "scout";

export interface AthleteOutreach {
  athleteId: string;
  athleteName: string;
  kind: OutreachKind;
  at: string;
}

interface ScoutState {
  contactedIds: Set<string>;
  scoutedIds: Set<string>;
  items: AthleteOutreach[];
  contactAthlete: (athleteId: string, athleteName: string, email?: string) => void;
  scoutAthlete: (athleteId: string, athleteName: string) => void;
  hasContacted: (athleteId: string) => boolean;
  hasScouted: (athleteId: string) => boolean;
}

const ScoutContext = createContext<ScoutState | null>(null);
const KEY = "athlink_athlete_outreach";

export function ScoutProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AthleteOutreach[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as AthleteOutreach[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const upsert = useCallback((athleteId: string, athleteName: string, kind: OutreachKind) => {
    setItems((prev) => {
      const without = prev.filter((i) => !(i.athleteId === athleteId && i.kind === kind));
      return [
        { athleteId, athleteName, kind, at: new Date().toISOString() },
        ...without,
      ];
    });
  }, []);

  const contactAthlete = useCallback(
    (athleteId: string, athleteName: string, email?: string) => {
      upsert(athleteId, athleteName, "contact");
      if (typeof window === "undefined") return;
      const subject = encodeURIComponent(`AthLink — interest in ${athleteName}`);
      const body = encodeURIComponent(
        `Hi ${athleteName},\n\nI saw your AthLink profile / clip and would like to connect.\n\nProfile: ${window.location.origin}/athletes/${athleteId}\n\n— Sent via AthLink`,
      );
      const to = email || "";
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    },
    [upsert],
  );

  const scoutAthlete = useCallback(
    (athleteId: string, athleteName: string) => {
      upsert(athleteId, athleteName, "scout");
    },
    [upsert],
  );

  const contactedIds = useMemo(
    () => new Set(items.filter((i) => i.kind === "contact").map((i) => i.athleteId)),
    [items],
  );
  const scoutedIds = useMemo(
    () => new Set(items.filter((i) => i.kind === "scout").map((i) => i.athleteId)),
    [items],
  );

  const value = useMemo<ScoutState>(
    () => ({
      contactedIds,
      scoutedIds,
      items,
      contactAthlete,
      scoutAthlete,
      hasContacted: (id) => contactedIds.has(id),
      hasScouted: (id) => scoutedIds.has(id),
    }),
    [contactedIds, scoutedIds, items, contactAthlete, scoutAthlete],
  );

  return <ScoutContext.Provider value={value}>{children}</ScoutContext.Provider>;
}

export function useScout() {
  const ctx = useContext(ScoutContext);
  if (!ctx) throw new Error("useScout must be used within ScoutProvider");
  return ctx;
}
