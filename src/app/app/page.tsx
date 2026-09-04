"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { destinationFor, shouldEnterOnboarding, joinPathFor } from "@/lib/onboarding";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";

/**
 * Post-auth app entry. Never dumps users on marketing HQ.
 * Guests → sign-in; members → role home (marketplace / dashboard).
 *
 * Waits for Clerk `isLoaded` so a signed-in Clerk member is not bounced to
 * /sign-in before ClerkAuthBridge + /api/auth/me finish hydrating.
 */
export default function AppEntryPage() {
  const { user, hydrated } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (!hydrated || !clerkLoaded) return;
    if (!user) {
      if (isSignedIn) return; // bridge still syncing
      router.replace("/sign-in?redirect_url=/app");
      return;
    }
    const target = shouldEnterOnboarding(user.id)
      ? joinPathFor(user.role === "coach" ? "coach" : "athlete")
      : destinationFor(user.role);
    router.replace(target);
  }, [user, hydrated, clerkLoaded, isSignedIn, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-brand-500">
      {t("loading")}
    </div>
  );
}
