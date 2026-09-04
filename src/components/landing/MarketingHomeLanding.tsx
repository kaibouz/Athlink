"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { joinPathFor, shouldEnterOnboarding, destinationFor } from "@/lib/onboarding";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { AthleteHomeLanding } from "@/components/athlete/AthleteHomeLanding";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { AthlinkProMark } from "@/components/brand/AthlinkProMark";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { LandingSplash } from "@/components/landing/LandingSplash";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";

/**
 * Hybrid athlete marketing page:
 * Marketing splash + AthlinkPro hero (blue Start Free), then AthleteHomeLanding body
 * (pitching how-it-works + athlete features / coaches / pricing / FAQ).
 */
export function MarketingHomeLanding() {
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const [intro, setIntro] = useState<"pending" | "crossfade" | "ready">("pending");

  // If client JS fails to hydrate (e.g. dev CORS), don't leave a permanent black veil.
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
    const timer = window.setTimeout(() => {
      router.replace(target);
    }, 0);
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
        <div className="landing-hero-bg relative overflow-hidden">
          <div className="landing-hero-wind" aria-hidden>
            <svg className="landing-hero-wind-defs" aria-hidden>
              <defs>
                <filter
                  id="land-hero-flutter"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                  colorInterpolationFilters="sRGB"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.022 0.004"
                    numOctaves="2"
                    seed="2"
                    result="noise"
                  >
                    <animate
                      attributeName="baseFrequency"
                      dur="6s"
                      values="0.022 0.004;0.03 0.005;0.024 0.004;0.022 0.004"
                      repeatCount="indefinite"
                    />
                  </feTurbulence>
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="36"
                    xChannelSelector="R"
                    yChannelSelector="R"
                  />
                </filter>
              </defs>
            </svg>
            <div className="landing-hero-wash landing-hero-wash-a" />
            <div className="landing-hero-wash landing-hero-wash-b" />
            <div className="landing-hero-wash landing-hero-wash-c" />
          </div>
          <HeroCoastline className="landing-coast" />
          <header className="relative z-20">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
              <AthlinkProLogo
                href="/for-athletes"
                size="header"
                variant="monogram"
                tone="onGradient"
                priority
              />
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/for-coaches" className="landing-nav-link hidden sm:inline-flex">
                  {t("join_coach_eyebrow")} →
                </Link>
                <div className="flex items-center gap-1.5">
                  <ClerkNavAuth loginLabel={t("nav_login")} />
                  <MarketingThemeToggle />
                  <LocaleSwitcher compact />
                </div>
              </div>
            </div>
          </header>

          <section className="relative z-10 mx-auto max-w-4xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-16 sm:pb-20">
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
            <div className="land-fade land-fade-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/join/athlete" className="group">
                <Button
                  size="lg"
                  className="btn-landing-primary h-12 min-w-48 rounded-xl border-0 px-6 text-sm font-bold sm:h-14 sm:text-base"
                >
                  {t("hero_cta_start")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/search" className="group">
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-landing-secondary h-12 min-w-40 rounded-xl px-5 text-sm font-bold sm:h-14 sm:text-base"
                >
                  {t("hero_cta_find_near")}
                </Button>
              </Link>
            </div>
            <p className="land-fade land-fade-delay-4 mt-6 text-xs font-medium tracking-wide text-brand-500 sm:text-sm">
              {t("land_trust_compact")}
            </p>
          </section>
        </div>

        <div className="landing-band">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-medium">{t("land_band_cities")}</p>
            <p className="font-semibold opacity-90">{t("land_band_beta")}</p>
          </div>
          <p className="pb-4 text-center text-sm font-bold tracking-wide">{t("land_band_tag")}</p>
        </div>

        <AthleteHomeLanding variant="body" />
      </div>
    </div>
  );
}
