"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoachGate } from "@/components/coach/CoachGate";

/** Roster lives on the dashboard — keep deep links working. */
export default function CoachStudentsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/coach/dashboard#my-athletes");
  }, [router]);

  return (
    <CoachGate>
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-brand-500">
        …
      </div>
    </CoachGate>
  );
}
