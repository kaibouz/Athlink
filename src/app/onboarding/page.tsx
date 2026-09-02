import { Suspense } from "react";
import { OnboardingClient } from "./OnboardingClient";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-brand-500">
          Loading…
        </div>
      }
    >
      <OnboardingClient />
    </Suspense>
  );
}
