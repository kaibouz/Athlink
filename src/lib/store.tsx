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
import type { Booking, User, UserRole } from "@/types";
import { demoBookings } from "@/lib/data";

interface AuthState {
  user: User | null;
  bookings: Booking[];
  hydrated: boolean;
  login: (email: string, name: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
}

const AuthContext = createContext<AuthState | null>(null);
const USER_KEY = "athlink_user";
const BOOKINGS_KEY = "athlink_bookings";

function freshDemoBookings(): Booking[] {
  return demoBookings.map((b) => ({ ...b }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(freshDemoBookings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(USER_KEY);
      const rawBookings = localStorage.getItem(BOOKINGS_KEY);
      if (rawUser) setUser(JSON.parse(rawUser) as User);
      if (rawBookings) setBookings(JSON.parse(rawBookings) as Booking[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    else localStorage.removeItem(BOOKINGS_KEY);
  }, [bookings, user, hydrated]);

  const login = useCallback((email: string, name: string, role: UserRole) => {
    setBookings(freshDemoBookings());
    setUser({
      id: role === "coach" ? "u-coach-demo" : "u-athlete-1",
      email,
      name,
      role,
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setBookings(freshDemoBookings());
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(BOOKINGS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser((prev) => {
      if (!prev) {
        return {
          id: role === "coach" ? "u-coach-demo" : "u-athlete-1",
          email: role === "coach" ? "coach@athlink.app" : "athlete@athlink.app",
          name: role === "coach" ? "Demo Coach" : "Demo Athlete",
          role,
          avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${role}`,
        };
      }
      return {
        ...prev,
        id: role === "coach" ? "u-coach-demo" : prev.id.startsWith("u-coach") ? "u-athlete-1" : prev.id,
        role,
        name:
          role === "coach" && prev.role !== "coach"
            ? prev.name.includes("Coach")
              ? prev.name
              : `${prev.name} (Coach)`
            : prev.name.replace(/ \(Coach\)$/, ""),
      };
    });
  }, []);

  const addBooking = useCallback(
    (input: Omit<Booking, "id" | "createdAt" | "status">) => {
      const booking: Booking = {
        ...input,
        id: `b-${Date.now()}`,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      setBookings((prev) => [booking, ...prev]);
      return booking;
    },
    [],
  );

  const updateBookingStatus = useCallback((id: string, status: Booking["status"]) => {
    setBookings((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, status } : b));
      if (status === "confirmed" && typeof window !== "undefined") {
        const booking = next.find((b) => b.id === id);
        if (booking) {
          void import("@/lib/calendar").then(({ autoSyncBookingToCalendars }) => {
            autoSyncBookingToCalendars(booking);
          });
        }
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      bookings,
      hydrated,
      login,
      logout,
      switchRole,
      addBooking,
      updateBookingStatus,
    }),
    [user, bookings, hydrated, login, logout, switchRole, addBooking, updateBookingStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
