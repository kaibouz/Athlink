"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, QrCode, Zap } from "lucide-react";
import { coaches } from "@/lib/data";
import { BookingForm } from "@/components/coaches/BookingForm";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { specialtyLabel, sportLabel } from "@/lib/i18n/localize";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function QuickBookPage({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const { coachId } = use(params);
  const { t } = useLocale();
  const coach = coaches.find((c) => c.id === coachId) ?? coaches[0];

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link
        href={`/coaches/${coach.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-800"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("qr_full_profile")}
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border border-brand-100 bg-surface shadow-sm">
        <div className="bg-gradient-to-r from-ink to-brand-600 px-5 py-5 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-sky-200 uppercase">
            <QrCode className="h-3.5 w-3.5" />
            {t("qr_landing_badge")}
          </div>
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coach.avatarUrl}
              alt=""
              className="h-14 w-14 rounded-xl border border-white/30 bg-white"
            />
            <div>
              <h1 className="text-xl font-black">{coach.name}</h1>
              <p className="text-sm text-white/75">
                {sportLabel(t, coach.sport)} · {coach.city}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-white/20 text-white">
              {formatPrice(coach.pricePerHour)}
              {t("per_hr")}
            </Badge>
            {coach.specialties.slice(0, 2).map((s) => (
              <Badge key={s} className="bg-white/15 text-white">
                {specialtyLabel(t, s)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-b border-brand-50 bg-amber-50 px-5 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Zap className="h-4 w-4" />
            {t("qr_landing_hint")}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <BookingForm coach={coach} />
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-brand-400">{t("qr_landing_footer")}</p>
      <div className="mt-3 text-center">
        <Link href="/search">
          <Button variant="ghost" size="sm">
            {t("nav_find")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
