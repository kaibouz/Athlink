"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { HowAthlinkWorks } from "@/components/landing/HowAthlinkWorks";
import { PitchingHeroVideo } from "@/components/landing/PitchingHeroVideo";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/provider";

/** Standalone "How AthlinkPro works" page — same content as the /for-athletes section. */
export function HowItWorksPage() {
  const { t } = useLocale();

  return (
    <div className="landing-page landing-page-black min-h-full">
      <div className="landing-hero-bg landing-hero-black relative overflow-hidden">
        <div className="landing-hero-wind" aria-hidden>
          <div className="landing-hero-wash landing-hero-wash-a" />
          <div className="landing-hero-wash landing-hero-wash-b" />
          <div className="landing-hero-wash landing-hero-wash-c" />
        </div>
        <HeroCoastline className="landing-coast" />

        <header className="relative z-20">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <AthlinkProLogo href="/" size="header" variant="monogram" tone="onGradient" priority />
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/search" className="landing-nav-link hidden sm:inline-flex">
                {t("hq_browse_coaches")}
              </Link>
              <div className="flex items-center gap-1.5">
                <ClerkNavAuth loginLabel={t("nav_login")} />
                <MarketingThemeToggle />
                <LocaleSwitcher compact />
              </div>
            </div>
          </div>
        </header>

        <section className="relative z-10 mx-auto max-w-3xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-16 sm:pb-20">
          <p className="land-fade text-xs font-semibold tracking-[0.18em] text-brand-700 uppercase sm:text-sm">
            {t("how_eyebrow")}
          </p>
          <h1 className="land-fade land-fade-delay-1 font-brand mt-5 text-4xl tracking-[0.04em] text-brand-950 uppercase sm:text-5xl">
            {t("how_hero_title")}
          </h1>
          <p className="land-fade land-fade-delay-2 mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-600 sm:text-lg">
            {t("how_hero_lead")}
          </p>
          <div className="land-fade land-fade-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/get-started" className="group">
              <Button
                size="lg"
                variant="ghost"
                className="btn-premium h-12 min-w-48 rounded-xl px-6 sm:h-14"
              >
                {t("how_cta_start")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/search" className="group">
              <Button
                size="lg"
                variant="outline"
                className="btn-landing-secondary h-12 min-w-40 rounded-xl px-5 sm:h-14"
              >
                <Search className="h-4 w-4" />
                {t("hq_browse_coaches")}
              </Button>
            </Link>
          </div>
          <p className="land-fade land-fade-delay-4 mt-5 text-xs font-medium tracking-[0.14em] text-brand-500 uppercase">
            {t("land_trust_compact")}
          </p>
        </section>
      </div>

      <div className="landing-band">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-medium">{t("land_band_cities")}</p>
          <p className="font-semibold opacity-90">{t("land_band_beta")}</p>
        </div>
      </div>

      <PitchingHeroVideo />

      <HowAthlinkWorks />

      <section className="border-t border-white/10 bg-black py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-brand text-2xl tracking-[0.08em] text-brand-950 uppercase sm:text-3xl">
            {t("how_final_title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-600 sm:text-base">
            {t("how_final_sub")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/get-started" className="group">
              <Button size="lg" variant="ghost" className="btn-premium">
                {t("hq_get_started")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/for-coaches">
              <Button size="lg" variant="outline" className="btn-landing-secondary">
                {t("how_coach_link")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="land-footer border-t border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
          <AthlinkProLogo href="/" size="lg" variant="full" tone="onGradient" />
          <p className="text-xs tracking-[0.16em] text-brand-500 uppercase">
            {t("land_footer_tag")}
          </p>
        </div>
      </footer>
    </div>
  );
}
