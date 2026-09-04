"use client";

import { CoachGate } from "@/components/coach/CoachGate";
import { MyAthletesPanel } from "@/components/coach/MyAthletesPanel";

/** Coach roster — the "Athletes" tab in the sidebar and mobile tab bar. */
export default function CoachStudentsPage() {
  return (
    <CoachGate>
      <div className="mx-app mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <MyAthletesPanel />
      </div>
    </CoachGate>
  );
}
