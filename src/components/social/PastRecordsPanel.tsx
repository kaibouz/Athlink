"use client";

import { useMemo, useState } from "react";
import { ChevronDown, History, Map } from "lucide-react";
import {
  CA_REGIONS,
  choroplethColor,
  regionLessonCounts,
  type CaRegionId,
} from "@/lib/dashboard-analytics";
import type { Booking } from "@/types";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** Compact “Past records” + mini choropleth on profiles */
export function PastRecordsPanel({
  bookings = [],
  regionHint,
  records,
  defaultOpen = false,
}: {
  bookings?: Booking[];
  /** Force highlight for this profile’s home region */
  regionHint?: CaRegionId;
  records?: { date: string; title: string; note?: string }[];
  defaultOpen?: boolean;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(defaultOpen);

  const counts = useMemo(() => {
    const base = regionLessonCounts(bookings);
    if (regionHint) base[regionHint] = Math.max(base[regionHint], 1);
    return base;
  }, [bookings, regionHint]);
  const max = Math.max(...Object.values(counts), 1);

  const cells: { id: CaRegionId; d: string }[] = [
    { id: "bay", d: "M20,35 L48,28 L55,48 L42,65 L22,60 Z" },
    { id: "sac", d: "M48,28 L70,25 L75,45 L55,48 Z" },
    { id: "cv", d: "M42,65 L75,45 L82,90 L60,105 L38,88 Z" },
    { id: "ie", d: "M70,105 L92,100 L97,128 L78,135 L62,122 Z" },
    { id: "la", d: "M48,110 L70,105 L62,122 L50,130 L40,120 Z" },
    { id: "oc", d: "M62,122 L78,135 L75,148 L60,143 Z" },
    { id: "sd", d: "M60,143 L75,148 L72,170 L57,165 Z" },
  ];

  const demoRecords =
    records ??
    [
      { date: "2026-07-20", title: t("records_sample_1") },
      { date: "2026-07-10", title: t("records_sample_2") },
      { date: "2026-06-28", title: t("records_sample_3") },
    ];

  return (
    <div className="rounded-2xl border border-brand-100 bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-950">
          <History className="h-4 w-4 text-brand-600" />
          {t("records_bar_title")}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-brand-500 transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-t border-brand-50 px-4 pb-4">
          <p className="mt-3 text-xs text-brand-500">{t("records_bar_sub")}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr] sm:items-start">
            <div className="rounded-xl bg-brand-50/80 p-2">
              <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-brand-600 uppercase">
                <Map className="h-3 w-3" />
                {t("records_mini_map")}
              </div>
              <svg viewBox="0 0 110 180" className="mx-auto h-36 w-full" aria-hidden>
                <path
                  d="M35,10 L80,8 L100,60 L95,125 L80,175 L50,170 L28,125 L20,60 Z"
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
                {cells.map((cell) => (
                  <path
                    key={cell.id}
                    d={cell.d}
                    fill={choroplethColor(counts[cell.id], max)}
                    stroke="#fff"
                    strokeWidth="1"
                    opacity={regionHint && cell.id !== regionHint ? 0.55 : 1}
                  />
                ))}
              </svg>
            </div>
            <ul className="space-y-2">
              {demoRecords.map((r) => (
                <li
                  key={`${r.date}-${r.title}`}
                  className="rounded-xl border border-brand-50 bg-brand-50/40 px-3 py-2"
                >
                  <p className="text-[11px] font-semibold text-brand-400">{r.date}</p>
                  <p className="text-sm font-medium text-brand-900">{r.title}</p>
                  {r.note && <p className="mt-0.5 text-xs text-brand-600">{r.note}</p>}
                </li>
              ))}
              <li className="flex flex-wrap gap-2 pt-1 text-[10px] text-brand-500">
                {CA_REGIONS.filter((r) => counts[r.id] > 0)
                  .slice(0, 4)
                  .map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1">
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{ background: choroplethColor(counts[r.id], max) }}
                      />
                      {r.label}
                    </span>
                  ))}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
