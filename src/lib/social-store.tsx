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
import type { AthletePublicProfile, SocialPost } from "@/types";
import { athleteProfiles, seedSocialPosts } from "@/lib/social-data";

interface SocialState {
  posts: SocialPost[];
  profiles: AthletePublicProfile[];
  /** true when feed was loaded from /api/social/posts */
  apiEnabled: boolean;
  hydrated: boolean;
  refresh: () => Promise<void>;
  addPost: (
    post: Omit<SocialPost, "id" | "createdAt" | "likes">,
  ) => Promise<SocialPost>;
  updateProfile: (id: string, patch: Partial<AthletePublicProfile>) => void;
  createProfile: (
    input: Omit<AthletePublicProfile, "id" | "avatarUrl" | "seasonStats"> & {
      seasonLabel?: string;
    },
  ) => AthletePublicProfile;
  getMyProfile: (userId: string) => AthletePublicProfile | undefined;
}

const SocialContext = createContext<SocialState | null>(null);
const POSTS_KEY = "athlink_social_posts";
const PROFILES_KEY = "athlink_athlete_profiles";

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of secondary) map.set(row.id, row);
  for (const row of primary) map.set(row.id, row);
  return [...map.values()];
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<SocialPost[]>(seedSocialPosts);
  const [profiles, setProfiles] = useState<AthletePublicProfile[]>(athleteProfiles);
  const [hydrated, setHydrated] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/social/posts", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        posts?: SocialPost[];
        profiles?: AthletePublicProfile[];
        source?: string;
      };
      if (data.source === "db") {
        setApiEnabled(true);
        const dbPosts = data.posts ?? [];
        const dbProfiles = data.profiles ?? [];
        // Prefer live DB rows; pad with demo seed only when the table is empty.
        setPosts(dbPosts.length > 0 ? dbPosts : seedSocialPosts);
        setProfiles(
          dbProfiles.length > 0
            ? mergeById(dbProfiles, athleteProfiles)
            : athleteProfiles,
        );
      }
    } catch {
      /* keep local / seed */
    }
  }, []);

  useEffect(() => {
    void (async () => {
      let usedLocal = false;
      try {
        const rawPosts = localStorage.getItem(POSTS_KEY);
        const rawProfiles = localStorage.getItem(PROFILES_KEY);
        if (rawPosts) {
          setPosts(JSON.parse(rawPosts) as SocialPost[]);
          usedLocal = true;
        }
        if (rawProfiles) {
          setProfiles(JSON.parse(rawProfiles) as AthletePublicProfile[]);
        }
      } catch {
        /* ignore */
      }
      await refresh();
      // If API filled posts, prefer that; local-only posts stay until refresh replaces.
      if (!usedLocal) {
        /* seed already set */
      }
      setHydrated(true);
    })();
  }, [refresh]);

  useEffect(() => {
    if (!hydrated || apiEnabled) return;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }, [posts, hydrated, apiEnabled]);

  useEffect(() => {
    if (!hydrated || apiEnabled) return;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }, [profiles, hydrated, apiEnabled]);

  const addPost = useCallback(
    async (input: Omit<SocialPost, "id" | "createdAt" | "likes">) => {
      try {
        const res = await fetch("/api/social/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: input.type,
            caption: input.caption,
            videoUrl: input.videoUrl,
            posterUrl: input.posterUrl,
            statsNote: input.statsNote,
            coachName: input.coachName,
            sessionLabel: input.sessionLabel,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { post: SocialPost };
          setApiEnabled(true);
          setPosts((prev) => [data.post, ...prev.filter((p) => p.id !== data.post.id)]);
          return data.post;
        }
        // Only fall back to device-local when the API/DB is unavailable.
        if (res.status !== 503) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error || `HTTP_${res.status}`);
        }
      } catch (err) {
        if (err instanceof Error && err.message !== "Failed to fetch") {
          // Propagate auth/validation failures so compose can show an error.
          throw err;
        }
        /* network / 503 → local demo persistence below */
      }

      const post: SocialPost = {
        ...input,
        id: `p-${Date.now()}`,
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      setPosts((prev) => [post, ...prev]);
      return post;
    },
    [],
  );

  const updateProfile = useCallback((id: string, patch: Partial<AthletePublicProfile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const createProfile = useCallback(
    (
      input: Omit<AthletePublicProfile, "id" | "avatarUrl" | "seasonStats"> & {
        seasonLabel?: string;
      },
    ) => {
      const profile: AthletePublicProfile = {
        ...input,
        id: `a-${Date.now()}`,
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(input.name)}`,
        seasonStats: { seasonLabel: input.seasonLabel ?? "2026 season" },
      };
      setProfiles((prev) => [...prev, profile]);
      return profile;
    },
    [],
  );

  const getMyProfile = useCallback(
    (userId: string) => profiles.find((p) => p.userId === userId),
    [profiles],
  );

  const value = useMemo(
    () => ({
      posts,
      profiles,
      apiEnabled,
      hydrated,
      refresh,
      addPost,
      updateProfile,
      createProfile,
      getMyProfile,
    }),
    [
      posts,
      profiles,
      apiEnabled,
      hydrated,
      refresh,
      addPost,
      updateProfile,
      createProfile,
      getMyProfile,
    ],
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}
