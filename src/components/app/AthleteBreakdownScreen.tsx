"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Radar, Send, Share2, Sparkles } from "lucide-react";
import { DEMO_BREAKDOWN, type BreakdownFlag } from "@/lib/demo-breakdown";
import type { MessageKey } from "@/lib/i18n/messages";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Phase = "report" | "sending" | "sent" | "posting" | "posted";

function flagClass(flag: BreakdownFlag) {
  if (flag === "good") return "mx-bd-flag mx-bd-flag-good";
  return "mx-bd-flag mx-bd-flag-amber";
}

/** Stick-figure pair — athlete cyan over ghosted coach reference (concept) */
function SkeletonOverlay() {
  return (
    <svg className="mx-bd-skel" viewBox="0 0 200 260" aria-hidden>
      <g
        className="mx-bd-skel-ref"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="108" cy="42" r="14" />
        <path d="M108 56 L108 118" />
        <path d="M108 72 L78 98 L62 130" />
        <path d="M108 72 L148 92 L168 118" />
        <path d="M108 118 L88 168 L78 214" />
        <path d="M108 118 L132 170 L148 216" />
      </g>
      <g
        className="mx-bd-skel-ath"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="92" cy="46" r="14" />
        <path d="M92 60 L96 122" />
        <path d="M96 76 L64 108 L48 142" />
        <path d="M96 76 L138 88 L162 108" />
        <path d="M96 122 L74 174 L66 222" />
        <path d="M96 122 L124 176 L142 224" />
      </g>
      <path
        d="M118 86 L138 76"
        className="mx-bd-skel-gap"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 3"
      />
    </svg>
  );
}

/**
 * AthlinkPro concept — AI breakdown.
 * Demo report (no real CV yet): cyan athlete vs ghost coach reference,
 * amber/green flags, send to coach / post to feed.
 */
export function AthleteBreakdownScreen() {
  const { user } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("report");
  const report = DEMO_BREAKDOWN;

  useEffect(() => {
    if (phase !== "sending" && phase !== "posting") return;
    const timer = window.setTimeout(() => {
      setPhase(phase === "sending" ? "sent" : "posted");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (!user) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("bd_title")}</h1>
        <p className="mt-2 text-[color:var(--mx-dim)]">{t("bookings_login_hint")}</p>
        <Link href="/sign-in?redirect_url=/breakdown" className="mt-6 inline-block">
          <Button className="mx-btn mx-btn-accent border-0">{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-app mx-role-athlete mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-4 flex items-start gap-3">
        <button
          type="button"
          className="mx-btn mx-btn-ghost !px-2"
          aria-label={t("bd_back")}
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black tracking-tight">{t(report.titleKey)}</h1>
            <span className="mx-pill mx-pill-cyan text-[0.65rem]">Pro</span>
          </div>
          <p className="text-xs text-[color:var(--mx-dimmer)]">{t(report.subtitleKey)}</p>
        </div>
        <Sparkles className="h-5 w-5 shrink-0 text-[color:var(--mx-blue-2)]" aria-hidden />
      </header>

      <div className="mx-bd-stage mb-3">
        <div className="mx-bd-stage-meta">
          <span>{report.clipLabel}</span>
          <span>{t("bd_processed_in", { n: report.processedInSec })}</span>
        </div>
        <SkeletonOverlay />
        <p className="mx-bd-ref-note">{t(report.coachRefNoteKey)}</p>
      </div>

      <p className="mb-2 text-xs text-[color:var(--mx-dimmer)]">{report.sessionLabel}</p>

      <div className="mx-card mb-3 overflow-hidden !p-0">
        {report.metrics.map((m) => (
          <div key={m.id} className="mx-bd-metric">
            <span className="mx-bd-metric-label">{t(m.labelKey)}</span>
            <span className="mx-bd-metric-val">
              <b>{m.value}</b>
              <span className={flagClass(m.flag)}>{t(m.flagKey)}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mb-4 space-y-2">
        {report.metrics
          .filter((m): m is typeof m & { hintKey: MessageKey } => Boolean(m.hintKey) && m.flag !== "good")
          .map((m) => (
            <p key={m.id} className="text-xs leading-relaxed text-[color:var(--mx-dim)]">
              <span className={cn(flagClass(m.flag), "mr-1.5 align-middle")}>{t(m.flagKey)}</span>
              {t(m.hintKey)}
            </p>
          ))}
      </div>

      {(phase === "sent" || phase === "posted") && (
        <div className="mx-toast mb-3">
          <span className="mx-toast-ic">
            {phase === "sent" ? <Send className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          </span>
          <div>
            <b className="text-[0.75rem]">
              {phase === "sent" ? t("bd_sent_ok") : t("bd_posted_ok")}
            </b>
            <span className="block text-[0.7rem] text-[color:var(--mx-dimmer)]">
              {phase === "sent" ? t("bd_sent_hint") : t("bd_posted_hint")}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="mx-btn mx-btn-accent flex-1 border-0"
          disabled={phase === "sending" || phase === "posting"}
          onClick={() => setPhase("sending")}
        >
          <Send className="h-4 w-4" />
          {phase === "sending" ? t("loading") : t("bd_send_coach")}
        </button>
        <button
          type="button"
          className="mx-btn mx-btn-ghost flex-1"
          disabled={phase === "sending" || phase === "posting"}
          onClick={() => setPhase("posting")}
        >
          <Share2 className="h-4 w-4" />
          {phase === "posting" ? t("loading") : t("bd_post_feed")}
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href="/progress" className="mx-btn mx-btn-ghost flex-1 text-[0.75rem]">
          <Radar className="h-3.5 w-3.5" />
          {t("nav_progress")}
        </Link>
        <Link href="/messages" className="mx-btn mx-btn-ghost flex-1 text-[0.75rem]">
          {t("nav_messages")}
        </Link>
      </div>
    </div>
  );
}
