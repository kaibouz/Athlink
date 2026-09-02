"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  MessageSquare,
  Radar,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Feature = { icon: React.ComponentType<{ className?: string }>; text: string };

function JoinCard({
  eyebrow,
  title,
  body,
  features,
  href,
  cta,
  footnote,
  accent,
}: {
  eyebrow: string;
  title: string;
  body: string;
  features: Feature[];
  href: string;
  cta: string;
  footnote: string;
  accent: "coach" | "athlete";
}) {
  const isCoach = accent === "coach";

  return (
    <article
      className={cn(
        "join-card flex flex-col rounded-2xl border p-6 sm:p-8",
        isCoach ? "join-card-coach" : "join-card-athlete",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-[1.65rem]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{body}</p>

      <ul className="mt-6 flex-1 space-y-4">
        {features.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 text-sm leading-snug text-white/75">
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isCoach ? "bg-brand-500/20 text-sky-300" : "bg-amber-400/15 text-amber-300",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link href={href} className="group inline-flex w-full sm:w-auto">
          <span
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition sm:w-auto",
              isCoach
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-400"
                : "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300",
            )}
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <p className="mt-3 text-xs text-white/40">{footnote}</p>
      </div>
    </article>
  );
}

export function JoinGateway() {
  const { t } = useLocale();

  const coachFeatures: Feature[] = [
    { icon: CalendarDays, text: t("join_coach_feat_1") },
    { icon: Wallet, text: t("join_coach_feat_2") },
    { icon: Users, text: t("join_coach_feat_3") },
  ];

  const athleteFeatures: Feature[] = [
    { icon: Search, text: t("join_athlete_feat_1") },
    { icon: Radar, text: t("join_athlete_feat_2") },
    { icon: Bot, text: t("join_athlete_feat_3") },
    { icon: MessageSquare, text: t("join_athlete_feat_4") },
  ];

  return (
    <div className="join-gateway min-h-screen">
      <header className="join-gateway-header mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-black text-white">
            A
          </span>
          <span className="text-lg text-white">
            <AthLinkMark athClassName="text-white" linkClassName="text-sky-300" />
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/search"
            className="hidden text-sm font-medium text-white/55 hover:text-white sm:inline"
          >
            {t("nav_find")}
          </Link>
          <Link href="/login" className="text-sm font-medium text-white/55 hover:text-white">
            {t("nav_login")}
          </Link>
          <LocaleSwitcher compact />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-brand text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {t("join_gateway_title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/55 sm:text-lg">
            {t("join_gateway_sub")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-6">
          <JoinCard
            accent="coach"
            eyebrow={t("join_coach_eyebrow")}
            title={t("join_coach_title")}
            body={t("join_coach_body")}
            features={coachFeatures}
            href="/join/coach"
            cta={t("join_coach_cta")}
            footnote={t("join_coach_footnote")}
          />
          <JoinCard
            accent="athlete"
            eyebrow={t("join_athlete_eyebrow")}
            title={t("join_athlete_title")}
            body={t("join_athlete_body")}
            features={athleteFeatures}
            href="/join/athlete"
            cta={t("join_athlete_cta")}
            footnote={t("join_athlete_footnote")}
          />
        </div>
      </main>
    </div>
  );
}
