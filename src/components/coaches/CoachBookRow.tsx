"use client";

import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import type { CoachProfile, NextSlot } from "@/types";
import { formatDateJa, formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { specialtyLabel, sportLabel } from "@/lib/i18n/localize";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Mobile-concept coach list row: gradient avatar + next available slot */
export function CoachBookRow({ coach, nextSlot }: { coach: CoachProfile; nextSlot?: NextSlot }) {
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const skill = coach.specialties[0]
    ? specialtyLabel(t, coach.specialties[0])
    : sportLabel(t, coach.sport);
  const nextSlotLabel = nextSlot
    ? `${formatDateJa(nextSlot.date, dateLocale)} · ${nextSlot.startTime}`
    : coach.availabilityNote;

  return (
    <Link href={`/coaches/${coach.id}`} className="mx-li transition hover:border-[color:var(--mx-border-strong)]">
      <div className="mx-avatar mx-avatar-coach" aria-hidden>
        {initials(coach.name)}
      </div>
      <div className="mx-w">
        <b className="flex items-center gap-1.5">
          {coach.name}
          {coach.verified ? (
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[color:var(--mx-blue-2)]" />
          ) : null}
        </b>
        <span>
          {skill} · {coach.location}
        </span>
        <span className="!text-[color:var(--mx-blue-2)]">
          {t("search_next_slot")}: {nextSlotLabel}
        </span>
      </div>
      <div className="mx-r">
        {formatPrice(coach.pricePerHour)}
        <em className="!text-[color:var(--mx-dimmer)] !font-normal">
          <Star className="mr-0.5 inline h-3 w-3 fill-[color:var(--mx-amber)] text-[color:var(--mx-amber)]" />
          {coach.rating.toFixed(1)}
        </em>
      </div>
    </Link>
  );
}
