"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";
import type { CoachProfile, NextSlot } from "@/types";
import { formatPrice, formatTime } from "@/lib/utils";
import { todayKey } from "@/lib/dates";
import { useLocale } from "@/lib/i18n/provider";
import { specialtyLabel, sportLabel } from "@/lib/i18n/localize";
import { LEVELS, labelFor } from "@/lib/coach-taxonomy";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Placeholder avatars (generated / silhouette) read as clip-art — show initials. */
function hasRealPhoto(url: string) {
  return Boolean(url) && !url.includes("dicebear.com") && !url.includes("person-silhouette");
}

/**
 * Coach card for the Book tab — the app's grid card: cover strip, photo,
 * verified check, skill · area, level chip, rating, price and the next open
 * day, so athletes can compare without opening every profile.
 */
export function CoachBookRow({ coach, nextSlot }: { coach: CoachProfile; nextSlot?: NextSlot }) {
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const skill = coach.specialties[0] ? specialtyLabel(t, coach.specialties[0]) : sportLabel(t, coach.sport);
  const area = coach.city || coach.location;
  const level = coach.levels?.[0] ? labelFor(LEVELS, coach.levels[0], locale) : null;

  let nextDay: string | null = null;
  if (nextSlot) {
    const day =
      nextSlot.date === todayKey()
        ? t("nav_today")
        : new Date(`${nextSlot.date}T00:00:00`).toLocaleDateString(dateLocale, { weekday: "short" });
    nextDay = `${day} ${formatTime(nextSlot.startTime, locale)}`;
  }

  return (
    <Link
      href={`/coaches/${coach.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--mx-border)] bg-[color:var(--mx-panel)] transition hover:border-[color:var(--mx-border-strong)]"
    >
      <div className={`relative h-12 bg-gradient-to-br ${coach.coverGradient}`}>
        {coach.verified ? (
          <span
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--mx-blue-2)] text-[#05070c]"
            title={t("coach_verified")}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <div className="relative z-10 -mt-7 flex flex-1 flex-col items-center px-3 pb-3 text-center">
        {hasRealPhoto(coach.avatarUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coach.avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full border-2 border-[color:var(--mx-panel)] object-cover"
          />
        ) : (
          <span className="mx-avatar mx-avatar-coach !h-14 !w-14 border-2 border-[color:var(--mx-panel)] !text-base" aria-hidden>
            {initials(coach.name)}
          </span>
        )}
        <b className="mt-2 line-clamp-1 text-[0.9rem] text-[color:var(--mx-text)]">{coach.name}</b>
        <span className="line-clamp-1 text-[0.72rem] text-[color:var(--mx-dimmer)]">
          {skill} · {area}
        </span>
        {level ? (
          <span className="mt-1.5 rounded-full border border-[color:var(--mx-border-strong)] px-2 py-0.5 text-[0.65rem] text-[color:var(--mx-dim)]">
            {level}
          </span>
        ) : null}
        <span className="mt-1.5 flex items-center gap-1 text-[0.72rem] text-[color:var(--mx-dim)]">
          <Star className="h-3 w-3 fill-[color:var(--mx-amber)] text-[color:var(--mx-amber)]" />
          {coach.rating.toFixed(1)}
          <span className="text-[color:var(--mx-dimmer)]">({coach.reviewCount})</span>
        </span>
        <div className="mt-auto flex w-full items-end justify-between gap-2 pt-2.5">
          <span className="text-[0.95rem] font-bold text-[color:var(--mx-text)]">{formatPrice(coach.pricePerHour)}</span>
          <span className="truncate text-right text-[0.68rem] font-semibold text-[color:var(--mx-blue-2)]">
            {nextDay ?? t("search_no_open")}
          </span>
        </div>
      </div>
    </Link>
  );
}
