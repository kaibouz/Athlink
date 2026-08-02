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
import type { CoachFeedback } from "@/types";
import { seedFeedback } from "@/lib/coach-students";

interface CoachToolsState {
  feedback: CoachFeedback[];
  sendFeedback: (input: Omit<CoachFeedback, "id" | "createdAt">) => CoachFeedback;
}

const CoachToolsContext = createContext<CoachToolsState | null>(null);
const KEY = "athlink_coach_feedback";

export function CoachToolsProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<CoachFeedback[]>(seedFeedback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFeedback(JSON.parse(raw) as CoachFeedback[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(feedback));
  }, [feedback, hydrated]);

  const sendFeedback = useCallback((input: Omit<CoachFeedback, "id" | "createdAt">) => {
    const item: CoachFeedback = {
      ...input,
      id: `f-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFeedback((prev) => [item, ...prev]);
    return item;
  }, []);

  const value = useMemo(() => ({ feedback, sendFeedback }), [feedback, sendFeedback]);

  return (
    <CoachToolsContext.Provider value={value}>{children}</CoachToolsContext.Provider>
  );
}

export function useCoachTools() {
  const ctx = useContext(CoachToolsContext);
  if (!ctx) throw new Error("useCoachTools must be used within CoachToolsProvider");
  return ctx;
}
