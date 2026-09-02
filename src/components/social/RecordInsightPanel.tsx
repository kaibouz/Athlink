"use client";

import Link from "next/link";
import { Brain, MapPin, MessageSquare, Sparkles } from "lucide-react";
import { students } from "@/lib/coach-students";
import { useCoachTools } from "@/lib/coach-tools";
import { CA_REGIONS, mapsLinks, type CaRegionId } from "@/lib/dashboard-analytics";
import { useLocale } from "@/lib/i18n/provider";
import { LessonRegionMap, type LessonRecord } from "@/components/social/LessonRegionMap";
import { LessonVenuePanel } from "@/components/maps/LessonVenuePanel";
import { Button } from "@/components/ui/Button";
import type { Booking } from "@/types";

function studentForRecord(record: LessonRecord) {
  return students.find((s) => s.name === record.title);
}

export function RecordInsightPanel({
  record,
  counts,
  max,
  regionHint,
  records,
  selectedRegion,
  onRegionChange,
  bookings = [],
}: {
  record: LessonRecord;
  counts: Record<CaRegionId, number>;
  max: number;
  regionHint?: CaRegionId;
  records: LessonRecord[];
  selectedRegion: CaRegionId | null;
  onRegionChange: (id: CaRegionId | null) => void;
  bookings?: Booking[];
}) {
  const { t, locale } = useLocale();
  const { feedback } = useCoachTools();
  const student = studentForRecord(record);
  const regionId = record.region ?? selectedRegion ?? regionHint ?? "la";
  const region = CA_REGIONS.find((r) => r.id === regionId);
  const links = mapsLinks(regionId);
  const studentFeedback = student
    ? feedback.filter((f) => f.studentId === student.id).slice(0, 3)
    : [];
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const linkedBooking =
    (record.bookingId && bookings.find((b) => b.id === record.bookingId)) ??
    bookings.find(
      (b) => b.athleteName === record.title && b.date === record.date.slice(0, 10),
    );

  return (
    <div className="flex min-w-0 flex-col gap-3 p-3 sm:p-4">
      {linkedBooking ? (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-500">
            <MapPin className="h-3 w-3" />
            {t("lesson_venue_title")}
          </p>
          <LessonVenuePanel booking={linkedBooking} compact />
        </div>
      ) : (
        <LessonRegionMap
        counts={counts}
        max={max}
        regionHint={regionHint}
        records={records}
        selected={selectedRegion}
        onSelectedChange={onRegionChange}
        embedded
      />
      )}

      <div className="rounded-xl border border-brand-100 bg-surface px-3 py-2.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-brand-950">{record.title}</p>
            <p className="text-xs text-brand-500">
              {record.date}
              {record.note ? ` · ${record.note}` : ""}
              {region ? ` · ${region.label}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <a
              href={links.google}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 hover:bg-brand-100"
            >
              Google
            </a>
            <a
              href={links.apple}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 hover:bg-brand-100"
            >
              Apple
            </a>
          </div>
        </div>
      </div>

      {student ? (
        <>
          <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-surface p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-bold text-brand-950">{t("student_summary")}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-brand-800">{student.aiSummary}</p>
            <p className="mt-2 rounded-lg bg-surface/90 px-2.5 py-2 text-xs text-brand-700">
              <span className="font-semibold">{t("student_last_note")}: </span>
              {student.lastSessionNote}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-100 bg-surface p-3">
              <p className="text-xs font-bold text-brand-950">{t("student_strengths")}</p>
              <ul className="mt-1.5 space-y-1">
                {student.strengths.slice(0, 3).map((item) => (
                  <li key={item} className="text-xs text-brand-700">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-brand-100 bg-surface p-3">
              <p className="text-xs font-bold text-brand-950">{t("student_improve")}</p>
              <ul className="mt-1.5 space-y-1">
                {student.improvements.slice(0, 3).map((item) => (
                  <li key={item} className="text-xs text-brand-700">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {student.lessonLog.length > 0 && (
            <div className="rounded-xl border border-brand-100 bg-surface p-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-brand-950">{t("lesson_log_title")}</h3>
              </div>
              <ul className="mt-2 space-y-1.5">
                {student.lessonLog.slice(0, 4).map((l) => (
                  <li
                    key={l.id}
                    className={`rounded-lg px-2.5 py-1.5 text-xs ${
                      l.date === record.date.slice(0, 10) ||
                      record.title === student.name
                        ? "bg-brand-100/70 ring-1 ring-brand-200"
                        : "bg-brand-50/60"
                    }`}
                  >
                    <span className="font-semibold text-brand-900">{l.focus}</span>
                    <span className="text-brand-500">
                      {" "}
                      · {l.date} · {l.durationMin}m
                    </span>
                    <p className="text-brand-600">{l.notes}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-brand-100 bg-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-brand-950">{t("feedback_history")}</h3>
              </div>
              <Link href={`/coach/feedback?student=${student.id}`}>
                <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]">
                  {t("student_send_feedback")}
                </Button>
              </Link>
            </div>
            {studentFeedback.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {studentFeedback.map((f) => (
                  <li key={f.id} className="rounded-lg bg-brand-50/60 px-2.5 py-2">
                    <p className="text-xs font-semibold text-brand-900">{f.subject}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-brand-600">{f.body}</p>
                    <p className="mt-1 text-[10px] text-brand-400">
                      {new Date(f.createdAt).toLocaleDateString(dateLocale)}
                      {f.aiAttached ? ` · ${t("feedback_attach_ai")}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-brand-500">{t("records_no_feedback")}</p>
            )}
          </div>

          <Link href={`/coach/students/${student.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-800">
            {t("students_view")} →
          </Link>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-3 py-4 text-sm text-brand-600">
          {t("records_no_ai_profile")}
        </p>
      )}
    </div>
  );
}

export { studentForRecord };
