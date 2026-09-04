"use client";

import { CoachGate } from "@/components/coach/CoachGate";
import { MyAthletesPanel } from "@/components/coach/MyAthletesPanel";
import { useMyCoach } from "@/lib/use-my-coach";
import { useLocale } from "@/lib/i18n/provider";
import { useApi } from "@/lib/client/use-api";
import type { StudentAthlete } from "@/types";

/** Coach Athletes tab — real roster wired to student_athletes. */
export default function CoachStudentsPage() {
  const { t } = useLocale();
  const { hasProfile } = useMyCoach();
  const { data, loading } = useApi<{ students: StudentAthlete[] }>(
    hasProfile ? "/api/coach/students" : null,
  );
  const students = data?.students;

  return (
    <CoachGate>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading && !students ? (
          <div className="py-16 text-center text-sm text-brand-500">{t("loading")}</div>
        ) : (
          <MyAthletesPanel students={students ?? []} />
        )}
      </div>
    </CoachGate>
  );
}
