"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Languages, MapPin, ShieldCheck, Star } from "lucide-react";
import type { CoachProfile, Review } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { PastRecordsPanel } from "@/components/social/PastRecordsPanel";
import { Badge } from "@/components/ui/Badge";
import { BookingForm } from "@/components/coaches/BookingForm";
import type { CaRegionId } from "@/lib/dashboard-analytics";

function regionFromLocation(loc: string): CaRegionId {
  const l = loc.toLowerCase();
  if (l.includes("orange")) return "oc";
  if (l.includes("diego")) return "sd";
  if (l.includes("francisco") || l.includes("bay") || l.includes("jose")) return "bay";
  if (l.includes("sacramento")) return "sac";
  if (l.includes("inland") || l.includes("riverside")) return "ie";
  if (l.includes("fresno") || l.includes("central")) return "cv";
  return "la";
}

export function CoachDetailView({
  coach,
  reviews,
}: {
  coach: CoachProfile;
  reviews: Review[];
}) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/search"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("coach_back")}
      </Link>

      <div
        className={`overflow-hidden rounded-3xl bg-gradient-to-br ${coach.coverGradient} p-6 text-white sm:p-8`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coach.avatarUrl}
            alt={coach.name}
            className="h-24 w-24 rounded-2xl border-4 border-white/30 bg-surface shadow-lg"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black">{coach.name}</h1>
              {coach.verified && (
                <Badge variant="verified" className="bg-surface/20 text-white">
                  <ShieldCheck className="h-3 w-3" />
                  {t("coach_verified")}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-white/90">
              {coach.sport} · {t("coach_years", { n: coach.experienceYears })}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/85">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {coach.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                {coach.rating}（{coach.reviewCount}）
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {coach.availabilityNote}
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-surface/15 px-5 py-3 backdrop-blur">
            <p className="text-sm text-white/80">{t("coach_price")}</p>
            <p className="text-2xl font-bold">
              {formatPrice(coach.pricePerHour)}
              <span className="text-sm font-normal">{t("per_hr")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-950">{t("coach_profile")}</h2>
            <p className="mt-3 leading-relaxed text-brand-700">{coach.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {coach.specialties.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
              {coach.formats.map((f) => (
                <Badge key={f} variant="neutral">
                  {f === "in_person" ? t("search_in_person") : t("search_online")}
                </Badge>
              ))}
            </div>
          </section>

          <PastRecordsPanel regionHint={regionFromLocation(coach.location)} />

          <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-950">{t("coach_career")}</h2>
            <ul className="mt-3 space-y-2">
              {coach.career.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-brand-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 text-sm text-brand-600">
              <Languages className="h-4 w-4" />
              {coach.languages.join(" · ")}
            </div>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-950">
              {t("coach_reviews", { n: reviews.length })}
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-brand-500">{t("coach_no_reviews")}</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="border-b border-brand-50 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-brand-900">{r.authorName}</span>
                      <span className="flex items-center gap-0.5 text-sm text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {r.rating}
                      </span>
                      <Badge variant="neutral">{r.athleteLevel}</Badge>
                      <span className="text-xs text-brand-400">{r.date}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-brand-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingForm coach={coach} />
        </aside>
      </div>
    </div>
  );
}
