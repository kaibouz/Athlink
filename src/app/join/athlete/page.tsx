import { Suspense } from "react";
import { OnboardingClient } from "@/app/onboarding/OnboardingClient";

export const dynamic = "force-dynamic";

export default function JoinAthletePage() {
  return (
    <Suspense
      fallback={
        <div className="app-page-bg flex min-h-screen items-center justify-center text-brand-500">Loading…</div>
      }
    >
      <OnboardingClient role="athlete" />
    </Suspense>
  );
}
