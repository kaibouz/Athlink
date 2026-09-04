"use client";

import Link from "next/link";
import { GraduationCap, ShieldCheck, Star } from "lucide-react";
import type { CoachProfile } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { loc, specialtyLabel, sportLabel } from "@/lib/i18n/localize";
import { cn } from "@/lib/utils";

function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]![0]}. ${parts[parts.length - 1]}`;
}

function cityShort(location: string) {
  return location.split(",")[0]?.trim() ?? location;
}

/** Concept Book grid card: banner, credentials, rating, price + next slot */
export function CoachBookCard({
  coach,
  bannerClass,
}: {
  coach: CoachProfile;
  bannerClass?: string;
}) {
  const { t, locale } = useLocale();
  const skill = coach.specialties[0]
    ? specialtyLabel(t, coach.specialties[0])
    : sportLabel(t, coach.sport);
  const school = coach.career[0] ? loc(locale, coach.career[0]) : null;
  const schoolShort =
    school && school.length > 22 ? `${school.slice(0, 20)}…` : school;

  return (
    <Link
      href={`/coaches/${coach.id}`}
      className="mx-cc group block overflow-hidden transition hover:border-[color:var(--mx-border-strong)]"
    >
      <div className={cn("mx-cc-ban", bannerClass)} aria-hidden />
      {coach.verified ? (
        <span className="mx-cc-ver" title={t("coach_verified")}>
          <ShieldCheck className="h-3 w-3" strokeWidth={3} />
        </span>
      ) : null}
      <div className="mx-cc-pfp" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
      </div>
      <div className="mx-cc-body">
        <b>{shortName(coach.name)}</b>
        <span className="mx-cc-sk">
          {skill} · {cityShort(coach.location)}
        </span>
        <div className="mx-cc-badges">
          {schoolShort ? (
            <span className="mx-cc-cred">
              <GraduationCap className="h-3 w-3 shrink-0" />
              {schoolShort}
            </span>
          ) : null}
          {coach.experienceYears >= 5 ? (
            <span className="mx-cc-cred mx-cc-cred-hi">
              {t("coach_years_short", { n: coach.experienceYears })}
            </span>
          ) : null}
        </div>
        <div className="mx-cc-stars">
          <Star className="inline h-3 w-3 fill-[color:var(--mx-amber)] text-[color:var(--mx-amber)]" />{" "}
          {coach.rating.toFixed(1)} ({coach.reviewCount})
        </div>
        <div className="mx-cc-foot">
          <b>{formatPrice(coach.pricePerHour)}</b>
          <em>{coach.availabilityNote || t("search_next_slot")}</em>
        </div>
      </div>
    </Link>
  );
}
