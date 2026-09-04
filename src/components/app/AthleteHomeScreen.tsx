"use client";

import Link from "next/link";
import { MapPin, MessageSquare, Navigation, Play } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { formatDateJa } from "@/lib/utils";

const HEAT = [
  0, 1, 0, 2, 1, 0, 3, 1, 2, 0, 1, 3, 2, 1, 0, 2, 3, 1, 0, 1, 2, 0, 1, 3, 2, 1, 0, 2,
];

/** Athlete Home — mobile concept: next session, stats, coach note, heatmap */
export function AthleteHomeScreen() {
  const { user, bookings } = useAuth();
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

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

  const next = bookings.find((b) => b.status === "pending" || b.status === "confirmed");
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

  return (
    <div className="mx-app mx-role-athlete mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link href="/breakdown" className="mx-toast mb-4 block transition hover:border-[color:var(--mx-blue-2)]">
        <span className="mx-toast-ic">
          <Play className="h-3.5 w-3.5" />
        </span>
        <div>
          <b className="text-[0.75rem]">{t("bd_home_toast_title")}</b>
          <span className="block text-[0.7rem] text-[var(--mx-dimmer)]">
            {t("bd_home_toast_sub")}
          </span>
        </div>
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
          <div className="mx-t">Next session · today</div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[0.95rem] font-bold">{next.coachName}</div>
              <div className="mt-0.5 text-[0.75rem] text-[var(--mx-dimmer)]">
                {next.format === "online" ? "Online" : "In person"} ·{" "}
                {formatDateJa(next.date, dateLocale)} · {next.startTime}–{next.endTime}
              </div>
              <span className="mx-pill mx-pill-green mt-2">Confirmed</span>
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
        <div className="mx-card">
          <div className="mx-t">Exit velo</div>
          <div className="mx-big">
            84 <span className="text-sm font-600 text-[var(--mx-green)]">▲2</span>
          </div>
        </div>
        <div className="mx-card">
          <div className="mx-t">Sessions · Sep</div>
          <div className="mx-big">
            6 <span className="text-base font-600 text-[var(--mx-dimmer)]">/8</span>
          </div>
        </div>
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">Coach says</div>
        <p className="text-sm leading-relaxed text-[var(--mx-text)]">
          “Hands are loading late — we’ll fix the trigger Thursday.”
        </p>
        <div className="mt-2 text-[0.7rem] text-[var(--mx-dimmer)]">Report card · Aug 31</div>
      </div>

      <div className="mx-card">
        <div className="mx-t">This week</div>
        <div className="mx-heat" aria-hidden>
          {HEAT.map((level, i) => (
            <i key={i} className={level === 0 ? undefined : `l${level}`} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[0.65rem] text-[var(--mx-dimmer)]">
          <span>Mon</span>
          <span>Sun</span>
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
