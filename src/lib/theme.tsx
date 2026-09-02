"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

export type ThemeMode = "dark";

const STORAGE_KEY = "athlink_theme";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme() {
  const root = document.documentElement;
  root.classList.add("dark");
  root.style.colorScheme = "dark";
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyTheme();
    try {
      localStorage.setItem(STORAGE_KEY, "dark");
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((_next: ThemeMode) => {
    applyTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme();
  }, []);

  const value = useMemo(
    () => ({ theme: "dark" as const, setTheme, toggleTheme }),
    [setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
