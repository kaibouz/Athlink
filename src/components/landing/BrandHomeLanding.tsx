"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, UserRound, Users } from "lucide-react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { AthlinkProMark } from "@/components/brand/AthlinkProMark";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { PitchingHeroVideo } from "@/components/landing/PitchingHeroVideo";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";
import { Button } from "@/components/ui/Button";
import { destinationFor, shouldEnterOnboarding, joinPathFor } from "@/lib/onboarding";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";

/**
 * Athlink HQ / brand home — marketplace pattern:
 * Browse inventory first, then role-specific signup. Logged-in users go to the app.
 */
export function BrandHomeLanding() {
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !user) return;
    const target = shouldEnterOnboarding(user.id)
      ? joinPathFor(user.role === "coach" ? "coach" : "athlete")
      : destinationFor(user.role);
    const timer = window.setTimeout(() => router.replace(target), 0);
    return () => window.clearTimeout(timer);
  }, [user, hydrated, router]);

  if (user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-brand-500">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="landing-page min-h-full">
      <div className="landing-hero-bg relative overflow-hidden">
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

        <section className="relative z-10 mx-auto max-w-4xl px-4 pt-12 pb-14 text-center sm:px-6 sm:pt-16 sm:pb-18">
          <p className="land-fade text-xs font-semibold tracking-[0.14em] text-brand-500 uppercase sm:text-sm">
            {t("hero_sport_label")}
            <span className="mx-1.5 text-brand-300">·</span>
            {t("hero_locations")}
          </p>
          <h1 className="land-fade land-fade-delay-1 mt-5">
            <AthlinkProMark size="hero" variant="hero" animated />
          </h1>
          <p className="land-fade land-fade-delay-2 mx-auto mt-5 max-w-xl text-base font-medium leading-snug text-brand-800 sm:text-lg">
            {t("hero_tagline")}
          </p>
          <p className="land-fade land-fade-delay-2 mx-auto mt-3 max-w-lg text-sm leading-relaxed text-brand-600">
            {t("hq_lead")}
          </p>

          {/* Demand-first CTA — marketplace best practice */}
          <div className="land-fade land-fade-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/search" className="group">
              <Button size="lg" variant="ghost" className="btn-premium h-12 min-w-52 rounded-xl px-7 sm:h-14">
                <Search className="h-4 w-4" />
                {t("hq_browse_coaches")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/get-started" className="group">
              <Button
                size="lg"
                variant="outline"
                className="btn-landing-secondary h-12 min-w-44 rounded-xl px-5 sm:h-14"
              >
                {t("hq_get_started")}
              </Button>
            </Link>
          </div>
          <p className="land-fade land-fade-delay-4 mt-5 text-xs font-medium tracking-wide text-brand-500">
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

      {/* Role forks — secondary to browse */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-brand text-3xl tracking-tight text-brand-950 sm:text-4xl">
            {t("hq_roles_title")}
          </h2>
          <p className="mt-2 text-brand-600">{t("hq_roles_sub")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            href="/for-athletes"
            className="land-panel group flex flex-col rounded-2xl p-6 transition hover:border-white/25 sm:p-8"
          >
            <Users className="h-7 w-7 text-brand-500" />
            <h3 className="mt-4 text-xl font-bold text-brand-950">{t("join_athlete_eyebrow")}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-600">{t("join_athlete_body")}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-white">
              {t("hq_athlete_path")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/for-coaches"
            className="land-panel group flex flex-col rounded-2xl p-6 transition hover:border-white/25 sm:p-8"
          >
            <UserRound className="h-7 w-7 text-brand-500" />
            <h3 className="mt-4 text-xl font-bold text-brand-950">{t("join_coach_eyebrow")}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-600">{t("join_coach_body")}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-white">
              {t("hq_coach_path")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-brand text-2xl tracking-tight text-brand-950 sm:text-3xl">
            {t("hq_platform_title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-600 sm:text-base">
            {t("hq_platform_body")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/search" className="group">
              <Button size="lg" variant="ghost" className="btn-premium">
                {t("hq_open_marketplace")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="btn-landing-secondary">
                {t("nav_login")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="land-footer border-t border-brand-200/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
          <p className="text-xs text-brand-500">{t("land_footer_tag")}</p>
        </div>
      </footer>
    </div>
  );
}
