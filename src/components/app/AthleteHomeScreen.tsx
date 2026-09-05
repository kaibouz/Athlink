"use client";

import Link from "next/link";
import { MapPin, MessageSquare, Navigation, Play, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { formatDateJa } from "@/lib/utils";
import { useApi } from "@/lib/client/use-api";
import type { AthleteProgress, ProgressMetric } from "@/types";

/** Metrics where a lower value is an improvement (delta arrow flips). */
const LOWER_BETTER = new Set(["pop_time", "sixty_time", "swing_length", "first_step", "transfer"]);

function DeltaTag({ metric }: { metric: ProgressMetric }) {
  if (metric.delta === null || metric.delta === 0) return null;
  const improved = LOWER_BETTER.has(metric.metric) ? metric.delta < 0 : metric.delta > 0;
  const arrow = metric.delta > 0 ? "▲" : "▼";
  return (
    <span
      className="text-sm font-600"
      style={{ color: improved ? "var(--mx-green)" : "var(--mx-amber)" }}
    >
      {arrow}
      {Math.abs(metric.delta)}
    </span>
  );
}

/** Athlete Home — mobile concept: breakdown toast, next session, live stats, coach note, heat map */
export function AthleteHomeScreen() {
  const { user, bookings } = useAuth();
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const { data } = useApi<{ progress: AthleteProgress | null }>(user ? "/api/me/progress" : null);
  const progress = data?.progress ?? null;

  if (!user) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("nav_home")}</h1>
        <p className="mt-2 text-[var(--mx-dim)]">{t("bookings_login_hint")}</p>
        <Link href="/sign-in?redirect_url=/home" className="mt-6 inline-block">
          <Button className="mx-btn mx-btn-accent border-0">{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  const next =
    progress?.nextSession ??
    bookings.find((b) => b.status === "pending" || b.status === "confirmed") ??
    null;
  const first = user.name.split(" ")[0] || user.name;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const weekday = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const headline = progress?.headline ?? [];
  const coachNote = progress?.reportCards?.[0] ?? null;
  const breakdown = progress?.latestBreakdown ?? null;
  const heat = progress?.heatmap ?? [];

  return (
    <div className="mx-app mx-route-texture mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {breakdown && (
        <Link href={`/breakdown/${breakdown.id}`} className="mx-toast mb-3 block">
          <span className="mx-toast-ic">
            <Play className="h-3.5 w-3.5" />
          </span>
          <div>
            <b className="text-[0.75rem]">Your {breakdown.title.toLowerCase().includes("delivery") ? "delivery" : "swing"} breakdown is ready</b>
            <span className="block text-[0.7rem] text-[var(--mx-dimmer)]">
              Processed in {breakdown.processedSeconds}s · tap to view
            </span>
          </div>
        </Link>
      )}

      <Link href="/breakdown/new" className="mx-btn mx-btn-accent mb-4 w-full border-0">
        <Sparkles className="h-4 w-4" />
        Analyze a clip with AI
      </Link>

      <header className="mx-hdr">
        <div>
          <h1>Hey {first}</h1>
          <small>{weekday}</small>
        </div>
        <div className="mx-avatar" aria-hidden>
          {initials}
        </div>
      </header>

      {next ? (
        <div className="mx-card mb-3">
          <div className="mx-t">
            Next session · {next.date === new Date().toISOString().slice(0, 10) ? "today" : formatDateJa(next.date, dateLocale)}
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[0.95rem] font-bold">{next.coachName}</div>
              <div className="mt-0.5 text-[0.75rem] text-[var(--mx-dimmer)]">
                {next.format === "online" ? "Online" : "In person"} ·{" "}
                {formatDateJa(next.date, dateLocale)} · {next.startTime}–{next.endTime}
              </div>
              <span className={`mx-pill mt-2 ${next.status === "confirmed" ? "mx-pill-green" : "mx-pill-amber"}`}>
                {next.status === "confirmed" ? "Confirmed" : "Pending"}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/messages" className="mx-btn mx-btn-ghost text-[0.75rem]">
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </Link>
            <Link href="/search" className="mx-btn mx-btn-ghost text-[0.75rem]">
              <Navigation className="h-3.5 w-3.5" />
              Directions
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-card mb-3">
          <div className="mx-t">Next session</div>
          <p className="text-sm text-[var(--mx-dim)]">{t("bookings_empty")}</p>
          <Link href="/search" className="mx-btn mx-btn-accent mt-3 inline-flex">
            {t("bookings_find")}
          </Link>
        </div>
      )}

      <div className="mx-stat-grid mb-3">
        {headline.length > 0 ? (
          headline.map((m) => (
            <div key={m.metric} className="mx-card">
              <div className="mx-t">{m.label}</div>
              <div className="mx-big">
                {m.latest} <DeltaTag metric={m} />
              </div>
              {m.unit ? (
                <div className="mt-1 text-[0.65rem] text-[var(--mx-dimmer)]">{m.unit}</div>
              ) : null}
            </div>
          ))
        ) : (
          <>
            <div className="mx-card">
              <div className="mx-t">Exit velo</div>
              <div className="mx-big">—</div>
            </div>
            <div className="mx-card">
              <div className="mx-t">Bat speed</div>
              <div className="mx-big">—</div>
            </div>
          </>
        )}
      </div>

      {coachNote && (
        <div className="mx-card mb-3">
          <div className="mx-t">Coach says</div>
          <p className="text-sm leading-relaxed text-[var(--mx-text)]">“{coachNote.body}”</p>
          <div className="mt-2 text-[0.7rem] text-[var(--mx-dimmer)]">
            Report card · {coachNote.coachName} · {formatDateJa(coachNote.createdAt.slice(0, 10), dateLocale)}
          </div>
        </div>
      )}

      <div className="mx-card">
        <div className="mx-t">Last 7 weeks</div>
        <div className="mx-heat" aria-hidden>
          {heat.map((cell) => (
            <i key={cell.date} className={cell.level === 0 ? undefined : `l${Math.min(3, cell.level)}`} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[0.65rem] text-[var(--mx-dimmer)]">
          <span>7 weeks ago</span>
          <span>This week</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href="/bookings" className="mx-btn mx-btn-ghost flex-1 text-[0.75rem]">
          <MapPin className="h-3.5 w-3.5" />
          All bookings
        </Link>
        <Link href="/progress" className="mx-btn mx-btn-accent flex-1 text-[0.75rem]">
          Progress
        </Link>
      </div>
    </div>
  );
}
