"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Booking, User, UserRole } from "@/types";
import { demoBookings } from "@/lib/data";

/** Which backend answered for the current user. "clerk" = Clerk session. */
export type AuthSource = "session" | "clerk" | null;

interface AuthState {
  user: User | null;
  bookings: Booking[];
  hydrated: boolean;
  apiEnabled: boolean;
  authSource: AuthSource;
  /** Re-reads /api/auth/me (athlink_session, then Clerk). Returns the resolved user. */
  refreshUser: () => Promise<User | null>;
  /** Lets the Clerk bridge hand the provider a signOut() without importing Clerk here. */
  registerClerkSignOut: (signOut: (() => Promise<void>) | null) => void;
  login: (email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const USER_KEY = "athlink_user";
const BOOKINGS_KEY = "athlink_bookings";

function freshDemoBookings(): Booking[] {
  return demoBookings.map((b) => ({ ...b }));
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0]?.trim() || "Athlete";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(freshDemoBookings);
  const [hydrated, setHydrated] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(false);
  const [authSource, setAuthSource] = useState<AuthSource>(null);
  const clerkSignOutRef = useRef<(() => Promise<void>) | null>(null);

  const registerClerkSignOut = useCallback((signOut: (() => Promise<void>) | null) => {
    clerkSignOutRef.current = signOut;
  }, []);

  /**
   * /api/auth/me resolves the athlink_session cookie first and falls back to
   * the Clerk server session, so a Clerk-only member hydrates here too. Without
   * this the /app entry page saw user === null and bounced to /sign-in, which
   * Clerk immediately bounced back — the redirect loop this replaces.
   */
  const hydrateFromApi = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return false;
      const data = (await res.json()) as {
        user: User | null;
        bookings: Booking[];
        authSource?: AuthSource;
      };
      setApiEnabled(true);
      setAuthSource(data.authSource ?? (data.user ? "session" : null));
      if (data.user) {
        setUser(data.user);
        setBookings(data.bookings);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        user: User | null;
        bookings: Booking[];
        authSource?: AuthSource;
      };
      setApiEnabled(true);
      setAuthSource(data.authSource ?? (data.user ? "session" : null));
      setUser(data.user);
      if (data.user) setBookings(data.bookings);
      return data.user;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const apiOk = await hydrateFromApi();
      if (!apiOk) {
        try {
          const rawUser = localStorage.getItem(USER_KEY);
          const rawBookings = localStorage.getItem(BOOKINGS_KEY);
          if (rawUser) setUser(JSON.parse(rawUser) as User);
          if (rawBookings) setBookings(JSON.parse(rawBookings) as Booking[]);
        } catch {
          /* ignore */
        }
      }
      setHydrated(true);
    })();
  }, [hydrateFromApi]);

  useEffect(() => {
    if (!hydrated || apiEnabled) return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user, hydrated, apiEnabled]);

  useEffect(() => {
    if (!hydrated || apiEnabled) return;
    if (user) localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    else localStorage.removeItem(BOOKINGS_KEY);
  }, [bookings, user, hydrated, apiEnabled]);

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = (await res.json()) as { user: User };
          setUser(data.user);
          setApiEnabled(true);
          setAuthSource("session");
          const meRes = await fetch("/api/auth/me", { credentials: "include" });
          if (meRes.ok) {
            const me = (await meRes.json()) as { bookings: Booking[] };
            setBookings(me.bookings);
          }
          return { ok: true };
        }
        if (res.status === 503) {
          setBookings(freshDemoBookings());
          setUser({
            id: role === "coach" ? "u-coach-1" : "u-athlete-1",
            email,
            name: nameFromEmail(email),
            role,
            avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          });
          return { ok: true };
        }
        return { ok: false, error: "INVALID_CREDENTIALS" };
      } catch {
        setBookings(freshDemoBookings());
        setUser({
          id: role === "coach" ? "u-coach-1" : "u-athlete-1",
          email,
          name: nameFromEmail(email),
          role,
          avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        });
        return { ok: true };
      }
    },
    [],
  );

  const signup = useCallback(
    async (email: string, password: string, name: string, role: UserRole) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, name, role }),
        });
        if (res.ok) {
          const data = (await res.json()) as { user: User };
          setUser(data.user);
          setBookings([]);
          setApiEnabled(true);
          setAuthSource("session");
          return { ok: true };
        }
        if (res.status === 503) {
          setBookings(freshDemoBookings());
          setUser({
            id: role === "coach" ? "u-coach-1" : "u-athlete-1",
            email,
            name,
            role,
            avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          });
          return { ok: true };
        }
        const body = (await res.json()) as { error?: string };
        return { ok: false, error: body.error ?? "SIGNUP_FAILED" };
      } catch {
        setBookings(freshDemoBookings());
        setUser({
          id: role === "coach" ? "u-coach-1" : "u-athlete-1",
          email,
          name,
          role,
          avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        });
        return { ok: true };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    // Only tear down Clerk when Clerk is what signed this user in; calling it
    // for an athlink_session holder would navigate admins away for no reason.
    if (authSource === "clerk" && clerkSignOutRef.current) {
      try {
        await clerkSignOutRef.current();
      } catch {
        /* ignore */
      }
    }
    setUser(null);
    setBookings(freshDemoBookings());
    setApiEnabled(false);
    setAuthSource(null);
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(BOOKINGS_KEY);
    } catch {
      /* ignore */
    }
  }, [authSource]);

  const switchRole = useCallback((role: UserRole) => {
    if (authSource === "clerk") {
      // Persist so the role survives a reload; the optimistic update below
      // keeps the sidebar/nav responsive in the meantime.
      void fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      }).catch(() => {});
      setUser((prev) => (prev ? { ...prev, role } : prev));
      return;
    }
    setUser((prev) => {
      if (!prev) {
        return {
          id: role === "coach" ? "u-coach-1" : "u-athlete-1",
          email: role === "coach" ? "tanaka@athlink.app" : "ethan.park@athlink.app",
          name: role === "coach" ? "Shota Tanaka" : "Ethan Park",
          role,
          avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${role}`,
        };
      }
      return {
        ...prev,
        id: role === "coach" ? "u-coach-1" : "u-athlete-1",
        role,
      };
    });
  }, [authSource]);

  const addBooking = useCallback(
    async (input: Omit<Booking, "id" | "createdAt" | "status">) => {
      if (apiEnabled && user) {
        try {
          const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(input),
          });
          if (res.ok) {
            const data = (await res.json()) as { booking: Booking };
            setBookings((prev) => [data.booking, ...prev]);
            return data.booking;
          }
        } catch {
          /* fall through */
        }
      }

      const booking: Booking = {
        ...input,
        id: `b-${Date.now()}`,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      setBookings((prev) => [booking, ...prev]);
      return booking;
    },
    [apiEnabled, user],
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: Booking["status"]) => {
      if (apiEnabled) {
        try {
          await fetch(`/api/bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status }),
          });
        } catch {
          /* ignore */
        }
      }

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
    },
    [apiEnabled],
  );

  const value = useMemo(
    () => ({
      user,
      bookings,
      hydrated,
      apiEnabled,
      authSource,
      refreshUser,
      registerClerkSignOut,
      login,
      signup,
      logout,
      switchRole,
      addBooking,
      updateBookingStatus,
    }),
    [
      user,
      bookings,
      hydrated,
      apiEnabled,
      authSource,
      refreshUser,
      registerClerkSignOut,
      login,
      signup,
      logout,
      switchRole,
      addBooking,
      updateBookingStatus,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
