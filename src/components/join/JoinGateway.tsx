"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  MessageSquare,
  Radar,
  Search,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/provider";

type Feature = { icon: React.ComponentType<{ className?: string }>; text: string };

function JoinCard({
  eyebrow,
  title,
  body,
  features,
  href,
  cta,
  footnote,
  role,
}: {
  eyebrow: string;
  title: string;
  body: string;
  features: Feature[];
  href: string;
  cta: string;
  footnote: string;
  role: "coach" | "athlete";
}) {
  const isCoach = role === "coach";
  const RoleIcon = isCoach ? UserRound : Users;

  return (
    <article
      className={`land-panel flex h-full flex-col rounded-2xl p-6 sm:p-8 ${
        isCoach ? "join-card-coach" : "join-card-athlete"
      }`}
    >
      <p
        className={`text-xs font-semibold tracking-[0.14em] uppercase ${
          isCoach ? "text-brand-500" : "text-amber-400"
        }`}
      >
        {eyebrow}
      </p>
      <RoleIcon
        className={`mt-4 h-7 w-7 ${isCoach ? "text-brand-600" : "text-amber-400"}`}
      />
      <h2 className="mt-3 text-xl font-black tracking-tight text-brand-950 sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-600">{body}</p>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 text-sm leading-snug text-brand-700">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isCoach
                  ? "bg-brand-100 text-brand-600"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <Link href={href} className="group inline-block">
          <Button
            variant={isCoach ? "primary" : "primary"}
            className={
              isCoach
                ? "btn-landing-primary border-0"
                : "btn-athlete-primary border-0 font-bold"
            }
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
        <p className="mt-3 text-xs text-brand-500">{footnote}</p>
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
    <div className="join-gateway-page landing-page flex min-h-screen flex-col">
      <div className="landing-hero-bg relative flex flex-1 flex-col overflow-hidden">
        <div className="landing-hero-wind" aria-hidden>
          <div className="landing-hero-wash landing-hero-wash-a" />
          <div className="landing-hero-wash landing-hero-wash-b" />
          <div className="landing-hero-wash landing-hero-wash-c" />
        </div>
        <HeroCoastline className="landing-coast" />

        <header className="relative z-20">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/" className="text-lg" aria-label="AthLink">
              <AthLinkMark athClassName="text-brand-950" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="landing-nav-link">
                {t("nav_login")}
              </Link>
              <LocaleSwitcher compact />
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
          <div className="mx-auto max-w-2xl shrink-0 text-center">
            <h1 className="land-fade font-brand text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
              {t("join_gateway_title")}
            </h1>
            <p className="land-fade land-fade-delay-1 mt-4 text-base leading-relaxed text-brand-600 sm:text-lg">
              {t("join_gateway_sub")}
            </p>
            <p className="land-fade land-fade-delay-2 mt-4 text-xs font-medium tracking-wide text-brand-500 sm:text-sm">
              {t("land_trust_compact")}
            </p>
          </div>

          <div className="land-fade land-fade-delay-3 mt-10 grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
            <JoinCard
              role="coach"
              eyebrow={t("join_coach_eyebrow")}
              title={t("join_coach_title")}
              body={t("join_coach_body")}
              features={coachFeatures}
              href="/join/coach"
              cta={t("join_coach_cta")}
              footnote={t("join_coach_footnote")}
            />
            <JoinCard
              role="athlete"
              eyebrow={t("join_athlete_eyebrow")}
              title={t("join_athlete_title")}
              body={t("join_athlete_body")}
              features={athleteFeatures}
              href="/for-athletes"
              cta={t("join_athlete_cta")}
              footnote={t("join_athlete_footnote")}
            />
          </div>
        </main>
      </div>

      <footer className="land-footer border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
          <Link href="/" className="text-sm font-semibold text-brand-600 hover:underline">
            ← {t("nav_home")}
          </Link>
          <p className="text-xs text-brand-500">{t("land_footer_tag")}</p>
        </div>
      </footer>
    </div>
  );
}
