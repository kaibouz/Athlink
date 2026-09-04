"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Brain, MessageSquare, Search } from "lucide-react";
import { students } from "@/lib/coach-students";
import { useLocale } from "@/lib/i18n/provider";
import { specialtyLabel } from "@/lib/i18n/localize";

/** Compact / full My Athletes roster for the coach roster page (and dashboard embeds). */
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
        <header className="mx-hdr">
          <div>
            <span className="mx-pill mx-pill-accent mb-2 gap-1">
              <Brain className="h-3 w-3" />
              {t("students_ai_badge")}
            </span>
            <h1>{t("my_athletes_title")}</h1>
            <small>{t("my_athletes_sub")}</small>
          </div>
          <span className="mx-pill mx-pill-grey shrink-0">
            {t("students_count", { n: filtered.length })}
          </span>
        </header>
      )}

      {embedded && (
        <p className="mb-3 text-[0.7rem] text-[color:var(--mx-dimmer)]">
          {t("students_count", { n: filtered.length })}
        </p>
      )}

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[color:var(--mx-dimmer)]"
          aria-hidden
        />
        <input
          type="search"
          className="mx-search pl-9"
          placeholder={t("students_search_ph")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={t("students_search_ph")}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {shown.map((s) => (
          <article key={s.id} className="mx-card">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.avatarUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-xl bg-[color:var(--mx-panel-2)]"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold">{s.name}</h3>
                <p className="text-[0.7rem] text-[color:var(--mx-dimmer)]">
                  {s.level} · {s.position} · {s.age}y
                </p>
                <div className="mx-chip-row mt-1.5">
                  {s.focusAreas.slice(0, 3).map((f) => (
                    <span key={f} className="mx-pill mx-pill-grey">
                      {specialtyLabel(t, f)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[color:var(--mx-dim)]">
              {s.aiSummary}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/coach/students/${s.id}`}
                className="mx-btn mx-btn-accent text-[0.75rem]"
              >
                {t("my_athletes_open")}
              </Link>
              <Link
                href={`/coach/feedback?student=${s.id}`}
                className="mx-btn mx-btn-ghost text-[0.75rem]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {t("students_send_fb")}
              </Link>
            </div>

            {s.lessonLog[0] && (
              <p className="mt-2.5 border-t border-[color:var(--mx-border)] pt-2 text-[0.7rem] text-[color:var(--mx-dimmer)]">
                {t("my_athletes_last_lesson")}: {s.lessonLog[0].date} · {s.lessonLog[0].focus}
              </p>
            )}
          </article>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-6 text-center text-sm text-[color:var(--mx-dim)]">
          {t("students_empty")}
        </p>
      )}

      {compact && !embedded && filtered.length > shown.length && (
        <p className="mt-3 text-center text-xs text-[color:var(--mx-dimmer)]">
          {t("dash_athletes_more", { n: filtered.length - shown.length })}
        </p>
      )}
    </section>
  );
}
