"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, UserRound, Users } from "lucide-react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { HowAthlinkWorks } from "@/components/landing/HowAthlinkWorks";
import { LandingSplash } from "@/components/landing/LandingSplash";
import { PitchingHeroVideo } from "@/components/landing/PitchingHeroVideo";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";
import { Button } from "@/components/ui/Button";
import { destinationFor, shouldEnterOnboarding, joinPathFor } from "@/lib/onboarding";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";

/**
 * Athlink HQ — black canvas + official logo reveal motion, then marketplace path.
 * Ocean / Marlin accents retained from brand palette.
 */
export function BrandHomeLanding() {
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const [intro, setIntro] = useState<"pending" | "crossfade" | "ready">("pending");

  useEffect(() => {
    if (intro !== "pending") return;
    const timer = window.setTimeout(() => setIntro("ready"), 5000);
    return () => window.clearTimeout(timer);
  }, [intro]);

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
      <div className="flex min-h-[40vh] items-center justify-center bg-black text-sm text-brand-500">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="landing-page landing-page-black min-h-full">
      {intro === "pending" && (
        <div className="fixed inset-0 z-[79] bg-black" aria-hidden />
      )}
      <LandingSplash
        onReveal={() => setIntro("crossfade")}
        onFinished={() => setIntro("ready")}
      />

      <div
        className={
          intro === "pending"
            ? "landing-after-splash"
            : "landing-after-splash landing-after-splash-in"
        }
      >
        <div className="landing-hero-bg landing-hero-black relative overflow-hidden">
          <div className="landing-hero-wind" aria-hidden>
            <div className="landing-hero-wash landing-hero-wash-a" />
            <div className="landing-hero-wash landing-hero-wash-b" />
            <div className="landing-hero-wash landing-hero-wash-c" />
          </div>
          <HeroCoastline className="landing-coast" />

          <header className="relative z-20">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
              <AthlinkProLogo
                href="/"
                size="header"
                variant="monogram"
                tone="onGradient"
                priority
              />
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/how-it-works" className="landing-nav-link hidden sm:inline-flex">
                  {t("how_nav_link")}
                </Link>
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

          <section className="relative z-10 mx-auto max-w-4xl px-4 pt-10 pb-14 text-center sm:px-6 sm:pt-14 sm:pb-18">
            <p className="land-fade text-xs font-semibold tracking-[0.18em] text-brand-700 uppercase sm:text-sm">
              {t("hero_sport_label")}
              <span className="mx-1.5 text-brand-300">·</span>
              {t("hero_locations")}
            </p>

            {/* Official logo as primary heading — black reveal trajectory */}
            <h1 className="land-fade land-fade-delay-1 land-logo-reveal mx-auto mt-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/athlinkpro-logo-transparent.png"
                alt="AthlinkPro"
                width={1154}
                height={895}
                className="h-auto w-[min(100%,22rem)] object-contain sm:w-[min(100%,28rem)]"
                fetchPriority="high"
              />
            </h1>

            <p className="land-fade land-fade-delay-2 mx-auto mt-6 max-w-xl text-base font-medium leading-snug tracking-wide text-brand-800 sm:text-lg">
              {t("hero_tagline")}
            </p>
            <p className="land-fade land-fade-delay-2 mx-auto mt-3 max-w-lg text-sm leading-relaxed text-brand-600">
              {t("hq_lead")}
            </p>

            <div className="land-fade land-fade-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/search" className="group">
                <Button
                  size="lg"
                  variant="ghost"
                  className="btn-premium h-12 min-w-52 rounded-xl px-7 sm:h-14"
                >
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

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-brand text-3xl tracking-[0.06em] text-brand-950 uppercase sm:text-4xl">
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
              <h3 className="mt-4 text-xl font-bold tracking-wide text-brand-950 uppercase">
                {t("join_athlete_eyebrow")}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-600">
                {t("join_athlete_body")}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-700 group-hover:text-white">
                {t("hq_athlete_path")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/for-coaches"
              className="land-panel group flex flex-col rounded-2xl p-6 transition hover:border-white/25 sm:p-8"
            >
              <UserRound className="h-7 w-7 text-brand-500" />
              <h3 className="mt-4 text-xl font-bold tracking-wide text-brand-950 uppercase">
                {t("join_coach_eyebrow")}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-600">
                {t("join_coach_body")}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-700 group-hover:text-white">
                {t("hq_coach_path")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>

        <section className="border-t border-white/10 bg-black py-14">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-brand text-2xl tracking-[0.08em] text-brand-950 uppercase sm:text-3xl">
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

        <footer className="land-footer border-t border-white/10 bg-black">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
            <AthlinkProLogo href="/" size="lg" variant="full" tone="onGradient" />
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-brand-600">
              <Link href="/how-it-works" className="hover:text-white">
                {t("how_nav_link")}
              </Link>
              <Link href="/for-athletes" className="hover:text-white">
                {t("join_athlete_eyebrow")}
              </Link>
              <Link href="/for-coaches" className="hover:text-white">
                {t("join_coach_eyebrow")}
              </Link>
              <Link href="/search" className="hover:text-white">
                {t("hq_browse_coaches")}
              </Link>
            </nav>
            <p className="text-xs tracking-[0.16em] text-brand-500 uppercase">
              {t("land_footer_tag")}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
