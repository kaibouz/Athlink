"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { PitchingHeroVideo } from "@/components/landing/PitchingHeroVideo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/provider";

export function CoachHomeLanding() {
  const { t } = useLocale();

  const whyItems = [
    { icon: CalendarDays, title: t("land_why_sched_title"), desc: t("land_why_sched_desc") },
    { icon: Wallet, title: t("land_why_pay_title"), desc: t("land_why_pay_desc") },
    { icon: Users, title: t("land_why_client_title"), desc: t("land_why_client_desc") },
    { icon: Bot, title: t("land_why_ai_title"), desc: t("land_why_ai_desc") },
  ];

  return (
    <div className="landing-page min-h-full">
      <MarketingThemeToggle />

      <div className="landing-hero-bg relative overflow-hidden">
        <div className="landing-hero-wind" aria-hidden>
          <div className="landing-hero-wash landing-hero-wash-a" />
          <div className="landing-hero-wash landing-hero-wash-b" />
          <div className="landing-hero-wash landing-hero-wash-c" />
        </div>
        <HeroCoastline className="landing-coast" />

        <header className="relative z-20">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <AthlinkProLogo href="/for-coaches" size="header" variant="monogram" tone="onGradient" priority />
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/for-athletes" className="landing-nav-link hidden sm:inline-flex">
                {t("join_athlete_eyebrow")} →
              </Link>
              <Link href="/login" className="landing-nav-link">
                {t("nav_login")}
              </Link>
              <LocaleSwitcher compact />
            </div>
          </div>
        </header>

        <section className="relative z-10 mx-auto max-w-4xl px-4 pt-12 pb-10 text-center sm:px-6 sm:pt-16 sm:pb-14">
          <p className="land-fade text-xs font-semibold tracking-[0.14em] text-brand-500 uppercase sm:text-sm">
            {t("join_coach_eyebrow")}
          </p>
          <h1 className="land-fade land-fade-delay-1 mt-4 font-brand text-4xl font-bold tracking-tight text-brand-950 sm:text-5xl">
            {t("land_split_coach_title")}
          </h1>
          <p className="land-fade land-fade-delay-2 mx-auto mt-4 max-w-2xl text-base font-semibold leading-snug text-brand-700 sm:text-lg">
            {t("land_split_coach_lead")}
          </p>
          <p className="land-fade land-fade-delay-3 mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-600 sm:text-base">
            {t("join_coach_body")}
          </p>
          <ul className="land-fade land-fade-delay-3 mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-brand-700">
            <li>· {t("land_split_coach_1")}</li>
            <li>· {t("land_split_coach_2")}</li>
            <li>· {t("land_split_coach_3")}</li>
          </ul>
          <div className="land-fade land-fade-delay-4 mt-8 flex justify-center">
            <Link href="/join/coach" className="group">
              <Button
                size="lg"
                variant="ghost"
                className="btn-premium h-12 min-w-52 rounded-xl px-7 text-sm sm:h-14 sm:text-base"
              >
                {t("hero_cta_coach")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <div className="landing-band">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-medium">{t("land_band_cities")}</p>
          <p className="font-semibold opacity-90">{t("land_band_beta")}</p>
        </div>
        <p className="pb-4 text-center text-sm font-bold tracking-wide">{t("land_band_tag")}</p>
      </div>

      <PitchingHeroVideo />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex items-start gap-4">
          <UserRound className="mt-1 h-8 w-8 shrink-0 text-brand-600" />
          <div>
            <h2 className="font-brand text-3xl tracking-tight text-brand-950 sm:text-4xl">
              {t("land_why_title")}
            </h2>
            <p className="mt-2 text-brand-600">{t("join_coach_footnote")}</p>
          </div>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {whyItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="land-panel rounded-2xl p-6">
                <Icon className="h-6 w-6 text-brand-600" />
                <h3 className="mt-3 text-lg font-bold text-brand-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-600">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-brand text-3xl tracking-tight text-brand-950 sm:text-4xl">
            {t("join_coach_title")}
          </h2>
          <p className="mt-3 text-brand-600">{t("join_coach_body")}</p>
          <Link href="/join/coach" className="group mt-8 inline-block">
            <Button size="lg" variant="ghost" className="btn-premium">
              {t("join_coach_cta")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="land-footer border-t border-brand-200/20">
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
