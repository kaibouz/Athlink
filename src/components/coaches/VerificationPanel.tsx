"use client";

import { AlertTriangle, Check, ShieldCheck, ShieldOff } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import type { CoachProfile } from "@/types";

const LABEL_KEY: Record<string, MessageKey> = {
  identity: "vrf_identity",
  criminal_record: "vrf_criminal",
  sex_offender_registry: "vrf_sex_offender",
  safesport_training: "vrf_safesport",
  liability_insurance: "vrf_insurance",
  credential: "vrf_credential",
};

/**
 * What stands behind the badge. Parents of minor athletes are the audience, so
 * this names each check, who ran it, and when it lapses — including the ones a
 * coach has not supplied, which is the part that actually earns trust.
 */
export function VerificationPanel({ coach }: { coach: CoachProfile }) {
  const { t, locale } = useLocale();
  const v = coach.verification;
  if (!v) return null;

  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(dateLocale, { year: "numeric", month: "short", day: "numeric" }) : null;

  return (
    <section className="rounded-2xl border border-brand-100 bg-surface p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={
            coach.verified
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500"
          }
        >
          {coach.verified ? <ShieldCheck className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-brand-950">{t("vrf_title")}</h2>
          <p className="mt-1 text-sm text-brand-600">
            {coach.verified ? t("vrf_sub_verified") : t("vrf_sub_pending")}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {v.details.map((d) => {
          const ok = d.state === "active";
          const lapsed = d.state === "expired";
          return (
            <li
              key={d.type}
              className="flex items-start gap-3 rounded-xl border border-brand-100 px-3 py-2.5"
            >
              <span
                className={
                  ok
                    ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white"
                    : lapsed
                      ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white"
                      : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-200 text-brand-400"
                }
              >
                {ok ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : lapsed ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2">
                  <span className="text-sm font-semibold text-brand-900">
                    {t(LABEL_KEY[d.type])}
                  </span>
                  {d.required ? null : (
                    <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">
                      {t("vrf_optional")}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-brand-500">
                  {ok && d.provider
                    ? t("vrf_checked_by", { provider: d.provider, date: fmt(d.checkedAt) ?? "—" })
                    : lapsed
                      ? t("vrf_lapsed", { date: fmt(d.expiresAt) ?? "—" })
                      : t("vrf_not_submitted")}
                </span>
              </span>

              {ok && d.expiresAt ? (
                <span className="shrink-0 text-xs text-brand-500">
                  {t("vrf_valid_until", { date: fmt(d.expiresAt) ?? "—" })}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-brand-500">{t("vrf_footnote")}</p>
    </section>
  );
}
