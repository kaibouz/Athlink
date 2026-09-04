"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Languages,
  MapPin,
  Play,
  Share2,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { CoachProfile, Review } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/lib/store";
import { bookingsForCoach } from "@/lib/coach-bookings";
import { useLocale } from "@/lib/i18n/provider";
import { languageLabel, loc, locList, specialtyLabel, sportLabel } from "@/lib/i18n/localize";
import { LessonVenuePanel } from "@/components/maps/LessonVenuePanel";
import { venueForCoach } from "@/lib/lesson-venues";
import { PastRecordsPanel } from "@/components/social/PastRecordsPanel";
import { trackEvent } from "@/lib/track-event";
import { Badge } from "@/components/ui/Badge";
import { BookingForm } from "@/components/coaches/BookingForm";
import { CoachAvatar } from "@/components/coaches/CoachAvatar";
import type { CaRegionId } from "@/lib/dashboard-analytics";
import { cn } from "@/lib/utils";

type ProfileTab = "about" | "where" | "reviews";

function regionFromLocation(locStr: string): CaRegionId {
  const l = locStr.toLowerCase();
  if (l.includes("orange")) return "oc";
  if (l.includes("diego")) return "sd";
  if (l.includes("francisco") || l.includes("bay") || l.includes("jose")) return "bay";
  if (l.includes("sacramento")) return "sac";
  if (l.includes("inland") || l.includes("riverside")) return "ie";
  if (l.includes("fresno") || l.includes("central")) return "cv";
  return "la";
}

function handleFromName(name: string) {
  return `@${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18)}`;
}

/** Concept coach profile — X-style banner + About / Where & when / Reviews tabs */
export function CoachDetailView({
  coach,
  reviews,
}: {
  coach: CoachProfile;
  reviews: Review[];
}) {
  const { t, locale } = useLocale();
  const { user, bookings } = useAuth();
  const isOwnProfile = user?.role === "coach" && coach.userId === user.id;
  const coachBookings = bookingsForCoach(bookings, coach.id);
  const [tab, setTab] = useState<ProfileTab>("about");

  useEffect(() => {
    trackEvent("coach_profile_view", { coachId: coach.id }, coach.id);
  }, [coach.id]);

  const school = coach.career[0] ? loc(locale, coach.career[0]) : null;
  const sessionCount = Math.max(coachBookings.length * 12, coach.reviewCount * 5, 24);
  const athleteCount = Math.max(
    new Set(coachBookings.map((b) => b.athleteId)).size,
    Math.round(coach.reviewCount * 0.45),
    8,
  );
  const rebookPct = Math.min(98, Math.max(72, Math.round(80 + coach.rating * 3)));

  const backHref = user?.role === "coach" ? "/me" : "/search";

  const tabs = useMemo(
    () =>
      [
        { id: "about" as const, label: t("coach_tab_about") },
        { id: "where" as const, label: t("coach_tab_where") },
        { id: "reviews" as const, label: t("coach_tab_reviews") },
      ] as const,
    [t],
  );

  return (
    <div className="mx-app mx-auto max-w-6xl px-0 pb-10 sm:px-6 sm:py-6">
      <div className="mx-pprofile overflow-hidden sm:rounded-2xl sm:border sm:border-[color:var(--mx-border)]">
        <div className="mx-pbanner">
          <Link href={backHref} className="mx-pback" aria-label={t("coach_back")}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="mx-pshare" aria-hidden>
            <span>
              <Share2 className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className="relative px-4 pb-4 sm:px-6">
          <div className="mx-ppfp">
            <CoachAvatar size="lg" landing className="!h-full !w-full !rounded-full border-0" />
            {coach.verified ? (
              <span className="mx-ppfp-vchk" title={t("coach_verified")}>
                <ShieldCheck className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-[color:var(--mx-text)]">
                {coach.name}
              </h1>
              <p className="text-sm text-[color:var(--mx-dimmer)]">{handleFromName(coach.name)}</p>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--mx-dim)]">
                {loc(locale, coach.bio)}
              </p>
              <div className="mx-pmeta mt-3">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {coach.location}
                </span>
                <span>
                  {sportLabel(t, coach.sport)} · {t("coach_years", { n: coach.experienceYears })}
                </span>
              </div>
              <div className="mx-cc-badges mt-3">
                {school ? (
                  <span className="mx-cc-cred">
                    <GraduationCap className="h-3 w-3 shrink-0" />
                    {school.length > 28 ? `${school.slice(0, 26)}…` : school}
                  </span>
                ) : null}
                {coach.experienceYears >= 5 ? (
                  <span className="mx-cc-cred mx-cc-cred-hi">
                    {t("coach_years_short", { n: coach.experienceYears })}
                  </span>
                ) : null}
                {coach.verified ? (
                  <span className="mx-cc-cred mx-cc-cred-hi">{t("coach_verified")}</span>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl border border-[color:var(--mx-border)] bg-[color:var(--mx-panel)] px-4 py-3 text-right">
              <p className="text-xs text-[color:var(--mx-dimmer)]">{t("coach_price")}</p>
              <p className="text-2xl font-bold text-[color:var(--mx-text)]">
                {formatPrice(coach.pricePerHour)}
                <span className="text-sm font-normal text-[color:var(--mx-dimmer)]">{t("per_hr")}</span>
              </p>
            </div>
          </div>

          <div className="mx-pstats mt-4">
            <div>
              <b>{coach.rating.toFixed(1)}</b>
              {coach.reviewCount} {t("coach_stats_reviews")}
            </div>
            <div>
              <b>{sessionCount}</b>
              {t("coach_stats_sessions")}
            </div>
            <div>
              <b>{athleteCount}</b>
              {t("coach_stats_athletes")}
            </div>
            <div>
              <b>{rebookPct}%</b>
              {t("coach_stats_rebook")}
            </div>
          </div>

          <div className="mx-ptabs mt-4" role="tablist">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={cn("mx-ptab", tab === item.id && "on")}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-8 px-4 sm:px-0 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {tab === "about" ? (
            <>
              <section className="mx-card">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-[color:var(--mx-text)]">
                      {t("coach_intro_title")}
                    </h2>
                    <p className="text-xs text-[color:var(--mx-dimmer)]">{t("coach_intro_sub")}</p>
                  </div>
                </div>
                <div className="mx-introvid" aria-hidden>
                  <span className="mx-introvid-play">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                  <span className="text-xs text-[color:var(--mx-dimmer)]">
                    {t("coach_intro_placeholder")}
                  </span>
                </div>
              </section>

              <section className="mx-card">
                <div className="mb-3">
                  <h2 className="text-base font-bold text-[color:var(--mx-text)]">
                    {t("coach_specialties_title")}
                  </h2>
                  <p className="text-xs text-[color:var(--mx-dimmer)]">
                    {t("coach_specialties_sub")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {coach.specialties.map((s) => (
                    <Badge key={s}>{specialtyLabel(t, s)}</Badge>
                  ))}
                  {coach.formats.map((f) => (
                    <Badge key={f} variant="neutral">
                      {f === "in_person" ? t("search_in_person") : t("search_online")}
                    </Badge>
                  ))}
                </div>
              </section>

              <section className="mx-card">
                <h2 className="text-base font-bold text-[color:var(--mx-text)]">
                  {t("coach_career")}
                </h2>
                <ul className="mt-3 space-y-2">
                  {locList(locale, coach.career).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-[color:var(--mx-dim)]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--mx-blue-2)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2 text-sm text-[color:var(--mx-dimmer)]">
                  <Languages className="h-4 w-4" />
                  {coach.languages.map((l) => languageLabel(t, l)).join(" · ")}
                </div>
              </section>

              {isOwnProfile ? (
                <PastRecordsPanel
                  bookings={coachBookings}
                  regionHint={regionFromLocation(coach.location)}
                  defaultOpen
                />
              ) : null}
            </>
          ) : null}

          {tab === "where" ? (
            <>
              {coach.formats.includes("in_person") ? (
                <section className="mx-card">
                  <div className="mb-3">
                    <h2 className="text-base font-bold text-[color:var(--mx-text)]">
                      {t("coach_where_title")}
                    </h2>
                    <p className="text-xs text-[color:var(--mx-dimmer)]">
                      {t("lesson_venue_home_sub")}
                    </p>
                  </div>
                  <LessonVenuePanel venue={venueForCoach(coach.location)} />
                </section>
              ) : null}
              <section className="mx-card">
                <div className="mb-3">
                  <h2 className="text-base font-bold text-[color:var(--mx-text)]">
                    {t("coach_avail_title")}
                  </h2>
                  <p className="text-xs text-[color:var(--mx-dimmer)]">{t("coach_avail_sub")}</p>
                </div>
                <p className="mb-3 text-sm text-[color:var(--mx-dim)]">{coach.availabilityNote}</p>
                <div className="lg:hidden">
                  <BookingForm coach={coach} />
                </div>
              </section>
            </>
          ) : null}

          {tab === "reviews" ? (
            <section className="mx-card">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[color:var(--mx-text)]">
                    {t("coach_reviews", { n: reviews.length })}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-[color:var(--mx-amber)]">
                    <Star className="h-4 w-4 fill-[color:var(--mx-amber)]" />
                    <span className="font-semibold text-[color:var(--mx-text)]">
                      {coach.rating.toFixed(1)}
                    </span>
                    <span className="text-[color:var(--mx-dimmer)]">
                      · {coach.reviewCount} {t("coach_stats_reviews")}
                    </span>
                  </div>
                </div>
              </div>
              {reviews.length === 0 ? (
                <p className="text-sm text-[color:var(--mx-dimmer)]">{t("coach_no_reviews")}</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="border-b border-[color:var(--mx-border)] pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[color:var(--mx-text)]">
                          {r.authorName}
                        </span>
                        <span className="flex items-center gap-0.5 text-sm text-[color:var(--mx-amber)]">
                          <Star className="h-3.5 w-3.5 fill-[color:var(--mx-amber)]" />
                          {r.rating}
                        </span>
                        <Badge variant="neutral">{r.athleteLevel}</Badge>
                        <span className="text-xs text-[color:var(--mx-dimmer)]">{r.date}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[color:var(--mx-dim)]">
                        {loc(locale, r.comment)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-[color:var(--mx-text)]">
                  {t("coach_client_videos")}
                </h3>
                <div className="mx-cvid-grid mt-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="mx-cvid" aria-hidden>
                      <span className="text-[10px] text-[color:var(--mx-dimmer)]">Clip {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <BookingForm coach={coach} />
        </aside>
      </div>
    </div>
  );
}
