"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { HowAthlinkWorks } from "@/components/landing/HowAthlinkWorks";
import { HowItWorksAppWalkthrough } from "@/components/landing/HowItWorksAppWalkthrough";
import { LandingSplash } from "@/components/landing/LandingSplash";
import { PitchingHeroVideo } from "@/components/landing/PitchingHeroVideo";
import { GetTheAppCta } from "@/components/landing/GetTheAppCta";
import { RoleStartCta } from "@/components/landing/RoleStartCta";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";
import { QuickMyPageEntry } from "@/components/auth/QuickMyPageEntry";
import { destinationFor, shouldEnterOnboarding, joinPathFor } from "@/lib/onboarding";
import { MARKET_TO_PLATFORM, signInHref } from "@/lib/market-to-platform";
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
                variant="lockup"
                tone="onGradient"
                priority
              />
              <div className="flex items-center gap-2 sm:gap-3">
                <a href="#how-it-works" className="landing-nav-link hidden sm:inline-flex">
                  {t("how_nav_link")}
                </a>
                <a href="#how-it-works-coaches" className="landing-nav-link hidden lg:inline-flex">
                  {t("how_nav_coaches")}
                </a>
                <Link href={MARKET_TO_PLATFORM.browse} className="landing-nav-link hidden sm:inline-flex">
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
                src="/brand/athlinkpro-lockup.png"
                alt="AthlinkPro"
                width={1203}
                height={944}
                className="h-auto w-[min(100%,22rem)] object-contain sm:w-[min(100%,30rem)]"
                fetchPriority="high"
              />
            </h1>

            <p className="land-fade land-fade-delay-2 mx-auto mt-6 max-w-xl text-base font-medium leading-snug tracking-wide text-brand-800 sm:text-lg">
              {t("hero_tagline")}
            </p>
            <p className="land-fade land-fade-delay-2 mx-auto mt-3 max-w-lg text-sm leading-relaxed text-brand-600">
              {t("hq_lead")}
            </p>

            {/* Pick a side here — the next screen is Clerk, then the profile wizard */}
            <div className="land-fade land-fade-delay-3 mt-8 flex flex-col items-center gap-4">
              <RoleStartCta />
              <Link
                href={MARKET_TO_PLATFORM.browse}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-white"
              >
                <Search className="h-3.5 w-3.5" />
                {t("hq_browse_coaches")}
              </Link>
            </div>
            <div className="land-fade land-fade-delay-4 mx-auto mt-6 w-full max-w-md">
              <QuickMyPageEntry />
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

        {/* How AthlinkPro Works — athlete steps, then the coach cut below */}
        <HowAthlinkWorks id="how-it-works" showCta={false} />
        <HowAthlinkWorks audience="coach" id="how-it-works-coaches" showCta={false} />

        <PitchingHeroVideo />

        {/* Lower section — animated Athlete | Coach app walkthrough (concept screens) */}
        <HowItWorksAppWalkthrough id="app-tour" />

        {/* Continuity CTA — repeats the role choice at the end of the page */}
        <section className="border-t border-white/10 bg-black py-14">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-brand text-2xl tracking-[0.08em] text-brand-950 uppercase sm:text-3xl">
              {t("hq_platform_title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-600 sm:text-base">
              {t("hq_platform_body")}
            </p>
            {/* The page already offered the web funnel above; this closer sends
                visitors to the native app instead of repeating it. */}
            <GetTheAppCta className="mt-8" />
          </div>
        </section>

        <footer className="land-footer border-t border-white/10 bg-black">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
            <AthlinkProLogo href="/" size="lg" variant="full" tone="onGradient" />
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-brand-600">
              <a href="#how-it-works" className="hover:text-white">
                {t("how_nav_link")}
              </a>
              <a href="#how-it-works-coaches" className="hover:text-white">
                {t("how_nav_coaches")}
              </a>
              <Link href={MARKET_TO_PLATFORM.browse} className="hover:text-white">
                {t("hq_browse_coaches")}
              </Link>
              <Link href={signInHref()} className="hover:text-white">
                {t("nav_login")}
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
