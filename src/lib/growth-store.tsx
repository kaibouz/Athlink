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

export type InviteKind = "coach" | "player";

export interface GrowthInvite {
  id: string;
  kind: InviteKind;
  name: string;
  email: string;
  teamOrNote?: string;
  status: "sent" | "joined";
  createdAt: string;
}

interface GrowthState {
  invites: GrowthInvite[];
  inviteCoach: (name: string, email: string, note?: string) => GrowthInvite;
  invitePlayer: (name: string, email: string, team?: string) => GrowthInvite;
  markJoined: (id: string) => void;
  coachInvites: GrowthInvite[];
  playerInvites: GrowthInvite[];
  /** Beta north stars from your GTM: ~10 coaches → ~100 players */
  goals: { coaches: number; players: number };
}

const GrowthContext = createContext<GrowthState | null>(null);
const KEY = "athlink_growth_invites";

const seed: GrowthInvite[] = [
  {
    id: "gi1",
    kind: "coach",
    name: "Ryan Matsukawa",
    email: "ryan@example.com",
    teamOrNote: "Warm intro · long-time coach friend",
    status: "joined",
    createdAt: "2026-06-01T10:00:00",
  },
  {
    id: "gi2",
    kind: "coach",
    name: "Totoku",
    email: "totoku@example.com",
    teamOrNote: "Close coach network",
    status: "sent",
    createdAt: "2026-07-10T12:00:00",
  },
];

export function GrowthProvider({ children }: { children: ReactNode }) {
  const [invites, setInvites] = useState<GrowthInvite[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setInvites(JSON.parse(raw) as GrowthInvite[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(invites));
  }, [invites, hydrated]);

  const inviteCoach = useCallback((name: string, email: string, note?: string) => {
    const item: GrowthInvite = {
      id: `gi-${Date.now()}`,
      kind: "coach",
      name,
      email,
      teamOrNote: note,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    setInvites((prev) => [item, ...prev]);
    return item;
  }, []);

  const invitePlayer = useCallback((name: string, email: string, team?: string) => {
    const item: GrowthInvite = {
      id: `gi-${Date.now()}`,
      kind: "player",
      name,
      email,
      teamOrNote: team,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    setInvites((prev) => [item, ...prev]);
    return item;
  }, []);

  const markJoined = useCallback((id: string) => {
    setInvites((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "joined" as const } : i)),
    );
  }, []);

  const coachInvites = useMemo(() => invites.filter((i) => i.kind === "coach"), [invites]);
  const playerInvites = useMemo(() => invites.filter((i) => i.kind === "player"), [invites]);

  const value = useMemo(
    () => ({
      invites,
      inviteCoach,
      invitePlayer,
      markJoined,
      coachInvites,
      playerInvites,
      goals: { coaches: 10, players: 100 },
    }),
    [invites, inviteCoach, invitePlayer, markJoined, coachInvites, playerInvites],
  );

  return <GrowthContext.Provider value={value}>{children}</GrowthContext.Provider>;
}

export function useGrowth() {
  const ctx = useContext(GrowthContext);
  if (!ctx) throw new Error("useGrowth must be used within GrowthProvider");
  return ctx;
}
