"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { destinationFor, shouldEnterOnboarding, joinPathFor } from "@/lib/onboarding";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";

/**
 * Post-auth app entry. Never dumps users on marketing HQ.
 * Guests → sign-in; members → role home (marketplace / dashboard).
 */
export default function AppEntryPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/sign-in?redirect_url=/app");
      return;
    }
    const target = shouldEnterOnboarding(user.id)
      ? joinPathFor(user.role === "coach" ? "coach" : "athlete")
      : destinationFor(user.role);
    router.replace(target);
  }, [user, hydrated, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-brand-500">
      {t("loading")}
    </div>
  );
}
