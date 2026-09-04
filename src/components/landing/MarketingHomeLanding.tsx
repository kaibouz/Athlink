"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  MessageSquare,
  Search,
  Video,
} from "lucide-react";
import { joinPathFor, shouldEnterOnboarding, destinationFor } from "@/lib/onboarding";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { LandingSplash } from "@/components/landing/LandingSplash";
import { PitchingHeroVideo } from "@/components/landing/PitchingHeroVideo";
import { RoleJourneyChrome } from "@/components/landing/RoleJourneyChrome";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";

/**
 * Athlete marketing homepage after gateway click:
 * moderate info, smooth journey scroll, clear register path.
 */
export function MarketingHomeLanding() {
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

  const benefitItems = [
    { icon: CalendarDays, text: t("join_athlete_feat_1") },
    { icon: Video, text: t("join_athlete_feat_2") },
    { icon: Bot, text: t("join_athlete_feat_3") },
    { icon: MessageSquare, text: t("join_athlete_feat_4") },
  ];

  const steps = [
    { id: "journey-hero", label: t("journey_step_welcome") },
    { id: "how", label: t("journey_step_how") },
    { id: "journey-benefits", label: t("journey_step_benefits") },
    { id: "journey-register", label: t("journey_step_register") },
  ];

  return (
    <RoleJourneyChrome
      steps={steps}
      ctaHref="/join/athlete"
      ctaLabel={t("journey_register_athlete")}
      ctaFootnote={t("journey_sticky_athlete")}
    >
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
          <div id="journey-hero" className="landing-hero-bg relative overflow-hidden">
            <div className="landing-hero-wind" aria-hidden>
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
                {t("join_athlete_eyebrow")}
                <span className="mx-1.5 text-brand-300">·</span>
                {t("hero_locations")}
              </p>
            <h1 className="land-fade land-fade-delay-1 land-logo-reveal mx-auto mt-5 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/athlinkpro-logo-transparent.png"
                alt="AthlinkPro"
                width={1154}
                height={895}
                className="h-auto w-[min(100%,20rem)] object-contain sm:w-[min(100%,26rem)]"
                fetchPriority="high"
              />
            </h1>
              <p className="land-fade land-fade-delay-2 mx-auto mt-5 max-w-xl text-base font-medium leading-snug text-brand-800 sm:text-lg">
                {t("join_athlete_title")}
              </p>
              <p className="land-fade land-fade-delay-2 mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-600 sm:text-base">
                {t("join_athlete_body")}
              </p>
              <div className="land-fade land-fade-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
                <a href="#how" className="group">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="btn-premium h-12 min-w-48 rounded-xl px-6 text-sm sm:h-14 sm:text-base"
                  >
                    {t("journey_step_how")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </a>
                <Link href="/search" className="group">
                  <Button
                    size="lg"
                    variant="outline"
                    className="btn-landing-secondary h-12 min-w-40 rounded-xl px-5 text-sm font-semibold sm:h-14 sm:text-base"
                  >
                    <Search className="h-4 w-4" />
                    {t("hq_browse_coaches")}
                  </Button>
                </Link>
              </div>
              <p className="land-fade land-fade-delay-4 mt-6 text-xs font-medium tracking-wide text-brand-500 sm:text-sm">
                {t("join_athlete_footnote")}
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

          <PitchingHeroVideo />

          <section
            id="journey-benefits"
            className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20"
          >
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-brand text-3xl tracking-tight text-brand-950 sm:text-4xl">
                {t("journey_step_benefits")}
              </h2>
              <p className="mt-2 text-brand-600">{t("join_athlete_body")}</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {benefitItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.text} className="land-panel flex gap-4 rounded-2xl p-5">
                    <Icon className="mt-0.5 h-6 w-6 shrink-0 text-brand-500" />
                    <p className="text-sm leading-relaxed text-brand-700">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="journey-register" className="scroll-mt-24 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
              <p className="text-xs font-semibold tracking-[0.14em] text-brand-500 uppercase">
                {t("join_athlete_badge")}
              </p>
              <h2 className="mt-3 font-brand text-3xl tracking-tight text-brand-950 sm:text-4xl">
                {t("join_athlete_title")}
              </h2>
              <p className="mt-3 text-brand-600">{t("land_trust_compact")}</p>
              <Link href="/join/athlete" className="group mt-8 inline-block">
                <Button size="lg" variant="ghost" className="btn-premium">
                  {t("journey_register_athlete")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="mt-4 text-xs font-medium text-brand-500">{t("join_athlete_footnote")}</p>
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
      </div>
    </RoleJourneyChrome>
  );
}
