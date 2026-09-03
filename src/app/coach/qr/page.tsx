"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { CoachGate } from "@/components/coach/CoachGate";
import { useMyCoach } from "@/lib/use-my-coach";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { sportLabel } from "@/lib/i18n/localize";
import { useAuth } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CoachAvatar } from "@/components/coaches/CoachAvatar";

function QrInner() {
  const { user } = useAuth();
  const { t } = useLocale();
  const { coach, loading, hasProfile } = useMyCoach();
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-brand-500">{t("loading")}</div>
    );
  }

  if (!hasProfile || !coach) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("register_prompt_title")}</h1>
        <p className="mt-2 text-brand-600">{t("register_prompt_body")}</p>
        <Link href="/coach/register" className="mt-6 inline-block">
          <Button size="lg">{t("register_submit")}</Button>
        </Link>
      </div>
    );
  }

  const bookUrl = useMemo(() => {
    if (!coach) return "";
    if (typeof window === "undefined") return `/c/${coach.id}`;
    return `${window.location.origin}/c/${coach.id}`;
  }, [coach?.id]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(bookUrl)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(bookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">{t("qr_title")}</h1>
        <p className="mt-1 text-brand-600">{t("qr_sub")}</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-brand-100 bg-surface shadow-sm">
        <div className="bg-gradient-to-r from-ink to-ink-mid px-6 py-6 text-white">
          <div className="flex items-center gap-4">
            <CoachAvatar landing className="border-2 border-white/30" />
            <div>
              <p className="text-xl font-black">{user?.name ?? coach.name}</p>
              <p className="text-sm text-white/75">
                {sportLabel(t, coach.sport)} · {coach.location}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="bg-white/20 text-white">{formatPrice(coach.pricePerHour)}/hr</Badge>
                {coach.verified && (
                  <Badge className="bg-emerald-400/90 text-emerald-950">
                    {t("hero_verified")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:grid-cols-[240px_1fr] sm:items-center">
          <div className="mx-auto rounded-2xl border border-brand-100 bg-surface-elevated p-3 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt={t("qr_alt")} width={240} height={240} className="h-60 w-60" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-950">{t("qr_howto_title")}</h2>
            <ol className="mt-3 space-y-2 text-sm text-brand-700">
              <li>1. {t("qr_step_1")}</li>
              <li>2. {t("qr_step_2")}</li>
              <li>3. {t("qr_step_3")}</li>
            </ol>
            <p className="mt-4 break-all rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
              {bookUrl}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={copyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t("social_copied") : t("qr_copy")}
              </Button>
              <a href={qrSrc} download={`athlink-${coach.id}-qr.png`} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <Download className="h-4 w-4" />
                  {t("qr_download")}
                </Button>
              </a>
              <Link href={`/c/${coach.id}`}>
                <Button variant="secondary">
                  <Share2 className="h-4 w-4" />
                  {t("qr_open_page")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoachQrPage() {
  return (
    <CoachGate>
      <QrInner />
    </CoachGate>
  );
}
