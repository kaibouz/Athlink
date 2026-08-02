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
  addPost: (post: Omit<SocialPost, "id" | "createdAt" | "likes">) => SocialPost;
  updateProfile: (id: string, patch: Partial<AthletePublicProfile>) => void;
  getMyProfile: (userId: string) => AthletePublicProfile | undefined;
}

const SocialContext = createContext<SocialState | null>(null);
const POSTS_KEY = "athlink_social_posts";
const PROFILES_KEY = "athlink_athlete_profiles";

export function SocialProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<SocialPost[]>(seedSocialPosts);
  const [profiles, setProfiles] = useState<AthletePublicProfile[]>(athleteProfiles);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawPosts = localStorage.getItem(POSTS_KEY);
      const rawProfiles = localStorage.getItem(PROFILES_KEY);
      if (rawPosts) setPosts(JSON.parse(rawPosts) as SocialPost[]);
      if (rawProfiles) setProfiles(JSON.parse(rawProfiles) as AthletePublicProfile[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }, [posts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }, [profiles, hydrated]);

  const addPost = useCallback((input: Omit<SocialPost, "id" | "createdAt" | "likes">) => {
    const post: SocialPost = {
      ...input,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setPosts((prev) => [post, ...prev]);
    return post;
  }, []);

  const updateProfile = useCallback((id: string, patch: Partial<AthletePublicProfile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const getMyProfile = useCallback(
    (userId: string) => profiles.find((p) => p.userId === userId),
    [profiles],
  );

  const value = useMemo(
    () => ({ posts, profiles, addPost, updateProfile, getMyProfile }),
    [posts, profiles, addPost, updateProfile, getMyProfile],
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}
