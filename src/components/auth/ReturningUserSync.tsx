"use client";

import { useEffect } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { useAuth } from "@/lib/store";
import { rememberReturningUser } from "@/lib/returning-user";

/**
 * After a successful sign-in, persist a lightweight local profile so the next
 * visit can offer one-click (or passkey) return to My Page.
 */
export function ReturningUserSync() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated || !isLoaded) return;
    if (!isSignedIn || !user) return;

    rememberReturningUser({
      userId: user.id,
      name: user.name || clerkUser?.fullName || user.email,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl ?? clerkUser?.imageUrl ?? undefined,
    });
  }, [hydrated, isLoaded, isSignedIn, user, clerkUser?.fullName, clerkUser?.imageUrl]);

  return null;
}
