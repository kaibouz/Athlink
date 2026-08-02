"use client";

import Link from "next/link";
import { CalendarPlus, MapPin, MessageSquare, ShieldCheck, Star, Video } from "lucide-react";
import type { CoachProfile } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";

export function CoachCard({ coach }: { coach: CoachProfile }) {
  const { t } = useLocale();

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-surface shadow-sm transition-all hover:border-brand-200 hover:shadow-md">
      <Link href={`/coaches/${coach.id}`} className="group block">
        <div className="relative bg-gradient-to-br from-brand-50 to-brand-100 p-6">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coach.avatarUrl}
              alt={coach.name}
              className="h-16 w-16 rounded-2xl border-2 border-white bg-surface shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold text-brand-950 group-hover:text-brand-600">
                  {coach.name}
                </h3>
                {coach.verified && (
                  <Badge variant="verified">
                    <ShieldCheck className="h-3 w-3" />
                    {t("coach_verified")}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-brand-600">
                {coach.sport} · {t("coach_years_short", { n: coach.experienceYears })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {coach.specialties.slice(0, 3).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {coach.languages.map((l) => (
              <Badge key={l} variant="neutral">
                {l}
              </Badge>
            ))}
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-brand-600">{coach.bio}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-brand-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {coach.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {coach.rating} ({coach.reviewCount})
            </span>
            {coach.formats.includes("online") && (
              <span className="inline-flex items-center gap-1">
                <Video className="h-4 w-4" />
                {t("coach_online")}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-brand-50 pt-3">
            <span className="text-lg font-bold text-brand-950">
              {formatPrice(coach.pricePerHour)}
              <span className="text-sm font-normal text-brand-500">{t("per_hr")}</span>
            </span>
            <span className="text-sm font-medium text-brand-600">
              {coach.formats
                .map((f) => (f === "in_person" ? t("search_in_person") : t("search_online")))
                .join(" · ")}
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-auto flex gap-2 border-t border-brand-50 px-5 py-3">
        <Link href={`/coaches/${coach.id}`} className="flex-1">
          <Button size="sm" className="btn-landing-primary w-full border-0">
            <CalendarPlus className="h-3.5 w-3.5" />
            {t("card_book")}
          </Button>
        </Link>
        <Link href={`/messages`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full font-semibold">
            <MessageSquare className="h-3.5 w-3.5" />
            {t("card_message")}
          </Button>
        </Link>
      </div>
    </article>
  );
}
