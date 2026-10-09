"use client";

import { useEffect, useRef } from "react";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/lib/store";

/**
 * Keeps AuthProvider in step with the Clerk session.
 *
 * AuthProvider hydrates once from /api/auth/me on mount, but Clerk resolves its
 * session asynchronously in the browser and can change it mid-session (sign-in
 * from a modal, sign-out from UserButton). Without this, a member who signed in
 * through Clerk kept useAuth().user === null and /app ping-ponged with
 * /sign-in. Renders nothing.
 */
export function ClerkAuthBridge() {
  const { isLoaded, isSignedIn, userId, signOut } = useClerkAuth();
  const { user, hydrated, refreshUser, registerClerkSignOut } = useAuth();
  const lastClerkUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    registerClerkSignOut(async () => {
      await signOut();
    });
    return () => registerClerkSignOut(null);
  }, [registerClerkSignOut, signOut]);

  useEffect(() => {
    if (!isLoaded || !hydrated) return;

    const next = isSignedIn ? (userId ?? null) : null;
    if (lastClerkUserId.current === next) return;

    const firstObservation = lastClerkUserId.current === undefined;
    lastClerkUserId.current = next;

    // On the first pass the provider has already read /api/auth/me; only re-ask
    // when Clerk says somebody is signed in and the provider disagrees.
    if (firstObservation && !(next && !user)) return;

    void refreshUser();
  }, [isLoaded, isSignedIn, userId, hydrated, user, refreshUser]);

  return null;
}
