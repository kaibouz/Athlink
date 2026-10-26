"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { AVAILABILITY_BLOCKS } from "@/lib/coach-taxonomy";
import { cn } from "@/lib/utils";

type Block = { weekday: number; startTime: string; endTime: string };
const key = (weekday: number, start: string) => `${weekday}-${start}`;

/**
 * Weekly availability: the coach ticks the hours they teach on each weekday.
 * Athletes can only request these times (two weeks ahead, rolling).
 */
export function AvailabilityEditor({ onSaved }: { onSaved?: () => void }) {
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const [on, setOn] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  // Monday-first, which is how coaches plan a week.
  const days = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 0].map((wd) => ({
        wd,
        label: new Date(Date.UTC(2024, 0, 7 + wd)).toLocaleDateString(dateLocale, { weekday: "short", timeZone: "UTC" }),
      })),
    [dateLocale],
  );

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/coach/availability")
      .then((r) => (r.ok ? r.json() : { blocks: [] }))
      .then((d: { blocks: Block[] }) => {
        if (cancelled) return;
        setOn(new Set(d.blocks.map((b) => key(b.weekday, b.startTime))));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(k: string) {
    setStatus("idle");
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setStatus("idle");
    const blocks: Block[] = [];
    for (const { wd } of days) {
      for (const [startTime, endTime] of AVAILABILITY_BLOCKS) {
        if (on.has(key(wd, startTime))) blocks.push({ weekday: wd, startTime, endTime });
      }
    }
    try {
      const res = await fetch("/api/coach/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) onSaved?.();
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="availability" className="rounded-2xl border border-brand-100 bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-brand-950">{t("avail_title")}</h2>
          <p className="mt-1 text-sm text-brand-600">{t("avail_sub")}</p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!loaded || saving}
          className="mx-btn mx-btn-accent border-0 text-[0.8rem]"
        >
          {status === "saved" ? <Check className="h-4 w-4" /> : null}
          {saving ? t("loading") : status === "saved" ? t("avail_saved") : t("avail_save")}
        </button>
      </div>
      {status === "error" ? <p className="mt-2 text-sm text-rose-400">{t("booking_failed")}</p> : null}
      {loaded && on.size === 0 ? (
        <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {t("avail_empty")}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-1 text-center text-xs">
          <thead>
            <tr>
              <th className="w-16" />
              {days.map((d) => (
                <th key={d.wd} className="py-1 font-semibold text-brand-600">
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AVAILABILITY_BLOCKS.map(([start, end]) => (
              <tr key={start}>
                <td className="whitespace-nowrap pr-1 text-right text-brand-500">{start}</td>
                {days.map((d) => {
                  const k = key(d.wd, start);
                  const active = on.has(k);
                  return (
                    <td key={k}>
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-label={`${d.label} ${start}–${end}`}
                        onClick={() => toggle(k)}
                        className={cn(
                          "h-7 w-full rounded-md border transition",
                          active
                            ? "border-[color:var(--mx-blue-2)] bg-[color:var(--mx-accent-soft)] text-[color:var(--mx-blue-2)]"
                            : "border-brand-100 hover:border-brand-300",
                        )}
                      >
                        {active ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
