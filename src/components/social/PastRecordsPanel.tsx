"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, History, type LucideIcon } from "lucide-react";
import { regionForAthlete, regionLessonCounts, type CaRegionId } from "@/lib/dashboard-analytics";
import type { Booking } from "@/types";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { type LessonRecord } from "@/components/social/LessonRegionMap";
import { RecordInsightPanel, studentForRecord } from "@/components/social/RecordInsightPanel";

function recordKey(r: LessonRecord) {
  return `${r.date}-${r.title}`;
}

type RecordsMode = "past" | "upcoming";

function filterBookings(bookings: Booking[], mode: RecordsMode) {
  if (mode === "upcoming") {
    return bookings
      .filter((b) => b.status === "pending" || b.status === "confirmed")
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }
  return bookings
    .filter((b) => b.status === "completed")
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
}

function LessonRecordsPanel({
  mode,
  bookings = [],
  regionHint,
  records,
  defaultOpen = false,
}: {
  mode: RecordsMode;
  bookings?: Booking[];
  regionHint?: CaRegionId;
  records?: LessonRecord[];
  defaultOpen?: boolean;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<CaRegionId | null>(regionHint ?? null);

  const filteredBookings = useMemo(() => filterBookings(bookings, mode), [bookings, mode]);

  const counts = useMemo(() => {
    const base = regionLessonCounts(filteredBookings);
    if (regionHint) base[regionHint] = Math.max(base[regionHint], 1);
    return base;
  }, [filteredBookings, regionHint]);
  const max = Math.max(...Object.values(counts), 1);

  const demoRecords: LessonRecord[] = useMemo(() => {
    if (records) return records;
    if (mode === "upcoming") {
      return [
        { date: "2026-07-31", title: "Sofia Reyes", note: "16:00 · pending", region: "oc" },
        { date: "2026-08-02", title: "Ethan Park", note: "10:00 · confirmed", region: "la" },
        { date: "2026-08-03", title: "Kenji Nakamura", note: "14:00 · pending", region: "sd" },
      ];
    }
    return [
      { date: "2026-07-20", title: t("records_sample_1"), region: "la" },
      { date: "2026-07-10", title: t("records_sample_2"), region: "oc" },
      { date: "2026-06-28", title: t("records_sample_3"), note: t("records_map_online") },
    ];
  }, [records, mode, t]);

  const bookingRecords: LessonRecord[] = useMemo(
    () =>
      filteredBookings.map((b) => ({
        date: b.date,
        title: b.athleteName,
        note: `${b.startTime} · ${b.status}`,
        region: regionForAthlete(b.athleteName),
        bookingId: b.id,
        format: b.format,
      })),
    [filteredBookings],
  );

  const allRecords = useMemo(() => {
    if (records) return records;
    if (bookingRecords.length > 0) return bookingRecords;
    return demoRecords;
  }, [records, bookingRecords, demoRecords]);

  const selectedRecord = useMemo(
    () => allRecords.find((r) => recordKey(r) === selectedKey) ?? allRecords[0] ?? null,
    [allRecords, selectedKey],
  );

  useEffect(() => {
    setSelectedKey(null);
    setSelectedRegion(regionHint ?? null);
  }, [mode, regionHint]);

  useEffect(() => {
    if (!selectedKey && allRecords[0]) {
      setSelectedKey(recordKey(allRecords[0]));
      if (allRecords[0].region) setSelectedRegion(allRecords[0].region);
    }
  }, [allRecords, selectedKey]);

  function selectRecord(r: LessonRecord) {
    setSelectedKey(recordKey(r));
    if (r.region) setSelectedRegion(r.region);
  }

  const title = mode === "upcoming" ? t("records_upcoming_title") : t("records_bar_title");
  const sub = mode === "upcoming" ? t("records_upcoming_sub") : t("records_bar_sub");
  const Icon: LucideIcon = mode === "upcoming" ? CalendarDays : History;

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-950">
          <Icon className="h-4 w-4 text-brand-600" />
          {title}
          {allRecords.length > 0 && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-600">
              {allRecords.length}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-brand-500 transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-t border-brand-100">
          <p className="border-b border-brand-50 px-4 py-2 text-xs text-brand-500">{sub}</p>
          {selectedRecord ? (
            <div className="grid md:grid-cols-[minmax(0,220px)_1fr] md:divide-x md:divide-brand-100">
              <aside className="max-h-[70vh] overflow-y-auto border-b border-brand-100 md:border-b-0">
                <ul className="divide-y divide-brand-50">
                  {allRecords.map((r) => {
                    const student = studentForRecord(r);
                    const active = recordKey(r) === recordKey(selectedRecord);
                    return (
                      <li key={recordKey(r)}>
                        <button
                          type="button"
                          onClick={() => selectRecord(r)}
                          className={cn(
                            "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition",
                            active
                              ? "bg-brand-100/70 ring-1 ring-inset ring-brand-200"
                              : "hover:bg-brand-50/80",
                          )}
                        >
                          {student ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={student.avatarUrl}
                              alt=""
                              className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-brand-100"
                            />
                          ) : (
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-200 text-xs font-bold text-brand-700">
                              {r.title.charAt(0)}
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-brand-950">{r.title}</p>
                            <p className="text-[11px] text-brand-400">{r.date}</p>
                            {r.note && (
                              <p className="mt-0.5 truncate text-[11px] text-brand-600">{r.note}</p>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>

            <RecordInsightPanel
              record={selectedRecord}
              counts={counts}
              max={max}
              regionHint={regionHint}
              records={allRecords}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              bookings={bookings}
            />
            </div>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-brand-500">{t("records_upcoming_empty")}</p>
          )}
        </div>
      )}
    </Card>
  );
}

type RecordsPanelProps = {
  bookings?: Booking[];
  regionHint?: CaRegionId;
  records?: LessonRecord[];
  defaultOpen?: boolean;
};

export function PastRecordsPanel(props: RecordsPanelProps) {
  return <LessonRecordsPanel {...props} mode="past" />;
}

export function UpcomingRecordsPanel(props: RecordsPanelProps) {
  return <LessonRecordsPanel {...props} mode="upcoming" />;
}
