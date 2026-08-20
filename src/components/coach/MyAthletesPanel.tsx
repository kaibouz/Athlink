"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Brain, MessageSquare, Search } from "lucide-react";
import { students } from "@/lib/coach-students";
import { useLocale } from "@/lib/i18n/provider";
import { specialtyLabel } from "@/lib/i18n/localize";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** Compact / full My Athletes roster for dashboard (and optional standalone). */
export function MyAthletesPanel({
  compact = false,
  embedded = false,
  id = "my-athletes",
}: {
  compact?: boolean;
  embedded?: boolean;
  id?: string;
}) {
  const { t } = useLocale();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.level.toLowerCase().includes(query) ||
        s.position.toLowerCase().includes(query) ||
        s.focusAreas.some((f) => f.toLowerCase().includes(query)),
    );
  }, [q]);

  const shown = compact && !embedded ? filtered.slice(0, 4) : filtered;

  return (
    <section id={id} className="scroll-mt-20">
      {!embedded && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Brain className="h-3.5 w-3.5" />
              {t("students_ai_badge")}
            </div>
            <h2 className="text-xl font-bold text-brand-950 sm:text-2xl">
              {t("my_athletes_title")}
            </h2>
            <p className="mt-1 text-sm text-brand-600">{t("my_athletes_sub")}</p>
          </div>
          <p className="text-sm font-medium text-brand-500">
            {t("students_count", { n: filtered.length })}
          </p>
        </div>
      )}

      {embedded && (
        <p className="mb-3 text-xs font-medium text-brand-500">
          {t("students_count", { n: filtered.length })}
        </p>
      )}

      <div className={`relative max-w-md ${embedded ? "" : "mt-4"}`}>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
        <Input
          className="pl-9"
          placeholder={t("students_search_ph")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {shown.map((s) => (
          <article
            key={s.id}
            className="rounded-2xl border border-brand-100 bg-surface p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-xl bg-brand-50"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-brand-950">{s.name}</h3>
                <p className="text-xs text-brand-600">
                  {s.level} · {s.position} · {s.age}y
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {s.focusAreas.slice(0, 3).map((f) => (
                    <Badge key={f}>{specialtyLabel(t, f)}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-700">
              {s.aiSummary}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/coach/students/${s.id}`}>
                <Button size="sm">{t("my_athletes_open")}</Button>
              </Link>
              <Link href={`/coach/feedback?student=${s.id}`}>
                <Button size="sm" variant="secondary">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {t("students_send_fb")}
                </Button>
              </Link>
            </div>
            {s.lessonLog[0] && (
              <p className="mt-2 border-t border-brand-50 pt-2 text-[11px] text-brand-500">
                {t("my_athletes_last_lesson")}: {s.lessonLog[0].date} · {s.lessonLog[0].focus}
              </p>
            )}
          </article>
        ))}
      </div>

      {compact && !embedded && filtered.length > shown.length && (
        <p className="mt-3 text-center text-sm text-brand-500">
          {t("dash_athletes_more", { n: filtered.length - shown.length })}
        </p>
      )}
    </section>
  );
}
