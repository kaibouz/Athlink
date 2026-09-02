import { Suspense } from "react";
import { OnboardingClient } from "@/app/onboarding/OnboardingClient";

export const dynamic = "force-dynamic";

export default function JoinCoachPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-brand-500">Loading…</div>
      }
    >
      <OnboardingClient role="coach" />
    </Suspense>
  );
}
