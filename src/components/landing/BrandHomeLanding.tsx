"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, BadgeDollarSign, CalendarDays, MessageSquare, Search, ShieldCheck, Video } from "lucide-react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { HowAthlinkWorks } from "@/components/landing/HowAthlinkWorks";
import { HowItWorksAppWalkthrough } from "@/components/landing/HowItWorksAppWalkthrough";
import { LandingSplash } from "@/components/landing/LandingSplash";
import { PitchingHeroVideo } from "@/components/landing/PitchingHeroVideo";
import { GetTheAppCta } from "@/components/landing/GetTheAppCta";
import { RoleStartCta } from "@/components/landing/RoleStartCta";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { QuickMyPageEntry } from "@/components/auth/QuickMyPageEntry";
import { destinationFor, shouldEnterOnboarding, joinPathFor } from "@/lib/onboarding";
import { MARKET_TO_PLATFORM, signInHref } from "@/lib/market-to-platform";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { specialtyLabel } from "@/lib/i18n/localize";
import { SPECIALTIES } from "@/lib/data";
import "@/components/landing/market.css";

/**
 * AthlinkPro HQ — logo splash, then the market page in the .mk design layer
 * (navy + glass + cyan→violet; Space Grotesk / DM Sans). See market.css.
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
    <div className="landing-page landing-page-black mk min-h-full">
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
        <header className="mk-nav">
          <div className="mk-container flex h-16 items-center justify-between gap-3">
            <AthlinkProLogo href="/" size="header" variant="lockup" tone="onGradient" priority />
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="#how-it-works" className="landing-nav-link hidden lg:inline-flex">
                {t("how_nav_link")}
              </a>
              <a href="#how-it-works-coaches" className="landing-nav-link hidden xl:inline-flex">
                {t("how_nav_coaches")}
              </a>
              <Link href={MARKET_TO_PLATFORM.pricing} className="landing-nav-link hidden lg:inline-flex">
                {t("land_nav_pricing")}
              </Link>
              <Link href={MARKET_TO_PLATFORM.browse} className="landing-nav-link hidden md:inline-flex">
                {t("hq_browse_coaches")}
              </Link>
              <div className="flex items-center gap-1.5">
                <ClerkNavAuth loginLabel={t("nav_login")} />
                <LocaleSwitcher compact />
              </div>
            </div>
          </div>
        </header>

        {/* Hero — badge, promise with a gradient keyword, two clear starts,
            skill chips, and a glimpse of the product itself. */}
        <section className="relative overflow-hidden pb-24 pt-16 sm:pt-20">
          <span className="mk-orb mk-orb-a -left-40 -top-40" aria-hidden />
          <span className="mk-orb mk-orb-b -right-32 top-40" aria-hidden />
          <div className="mk-container relative grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
            <div className="text-center lg:text-left">
              <span className="mk-badge land-fade">
                <span className="mk-dot" aria-hidden />
                {t("mk_hero_badge")}
              </span>
              <h1 className="mk-h1 land-fade land-fade-delay-1 mt-6">
                {t("mk_hero_a")} <span className="mk-gradient-text">{t("mk_hero_b")}</span>
              </h1>
              <p className="mk-lead land-fade land-fade-delay-2 mx-auto mt-6 max-w-xl lg:mx-0">{t("hq_lead")}</p>
              <div className="land-fade land-fade-delay-3 mt-9 flex flex-col items-center gap-4 lg:items-start">
                <RoleStartCta className="lg:justify-start" />
                <QuickMyPageEntry className="w-full max-w-md" />
              </div>
              <div className="land-fade land-fade-delay-4 mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                {SPECIALTIES.slice(0, 5).map((s) => (
                  <Link key={s} href={`${MARKET_TO_PLATFORM.browse}?specialty=${s}`} className="mk-chip">
                    {specialtyLabel(t, s)}
                  </Link>
                ))}
                <Link href={MARKET_TO_PLATFORM.browse} className="mk-chip">
                  <Search className="h-3.5 w-3.5" />
                  {t("hq_browse_coaches")}
                </Link>
              </div>
            </div>

            {/* A glimpse of the product: the next lesson, confirmed. */}
            <div className="land-fade land-fade-delay-2 mx-auto w-full max-w-sm">
              <div className="mk-card mk-glow !p-6 hover:!transform-none">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[color:var(--mk-muted)]">{t("mk_card_next")}</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[rgba(0,255,136,0.12)] px-2.5 py-1 text-xs font-semibold text-[color:var(--mk-success)]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("coach_verified")}
                  </span>
                </div>
                <p className="mt-3 font-[family-name:var(--mk-heading)] text-3xl font-bold">{t("mk_card_when")}</p>
                <p className="mt-1 text-sm text-[color:var(--mk-muted)]">{t("mk_card_coach")}</p>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-[color:var(--mk-muted)]">
                    <span>{t("mk_card_progress")}</span>
                    <span className="font-semibold text-[color:var(--mk-success)]">▲ +4 mph</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full w-[72%] rounded-full bg-[image:var(--mk-grad)]" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {[
                    { icon: CalendarDays, label: t("nav_book") },
                    { icon: MessageSquare, label: t("nav_messages") },
                    { icon: Video, label: t("nav_feed") },
                    { icon: Activity, label: t("nav_progress") },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-[color:var(--mk-border)] bg-[color:var(--mk-glass)] py-3 text-[0.68rem] text-[color:var(--mk-muted)]"
                    >
                      <Icon className="h-4 w-4 text-[color:var(--mk-text)]" />
                      <span className="max-w-full truncate px-1">{label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="landing-band">
          <div className="mk-container flex flex-col gap-2 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">{t("land_band_cities")}</p>
            <p className="font-semibold opacity-90">{t("land_band_beta")}</p>
          </div>
        </div>

        {/* Trust first — what a parent needs to know before price. */}
        <section className="mk-section mk-section-alt">
          <div className="mk-container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mk-eyebrow">{t("mk_trust_eyebrow")}</span>
              <h2 className="mk-h2 mt-3">{t("mk_trust_title")}</h2>
              <p className="mk-lead mt-4">{t("mk_trust_sub")}</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                { icon: ShieldCheck, title: t("mk_trust_1_title"), desc: t("mk_trust_1_desc") },
                { icon: BadgeDollarSign, title: t("mk_trust_2_title"), desc: t("mk_trust_2_desc") },
                { icon: MessageSquare, title: t("mk_trust_3_title"), desc: t("mk_trust_3_desc") },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="mk-card">
                  <span className="mk-icon">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--mk-muted)]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How AthlinkPro Works — athlete steps, then the coach cut below */}
        <HowAthlinkWorks id="how-it-works" showCta={false} />
        <HowAthlinkWorks audience="coach" id="how-it-works-coaches" showCta={false} />

        <PitchingHeroVideo />

        {/* Lower section — animated Athlete | Coach app walkthrough (concept screens) */}
        <HowItWorksAppWalkthrough id="app-tour" />

        {/* Closing CTA — one more invitation, framed as the start of a journey. */}
        <section className="mk-section mk-section-alt relative overflow-hidden">
          <span className="mk-orb mk-orb-b left-1/2 top-0 -translate-x-1/2" aria-hidden />
          <div className="mk-container relative text-center">
            <h2 className="mk-h2">
              {t("mk_final_a")} <span className="mk-gradient-text">{t("mk_final_b")}</span>
            </h2>
            <p className="mk-lead mx-auto mt-4 max-w-xl">{t("hq_platform_body")}</p>
            <RoleStartCta className="mt-9" />
            <GetTheAppCta className="mt-6" />
          </div>
        </section>

        <footer className="border-t border-[color:var(--mk-border)]">
          <div className="mk-container flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
            <AthlinkProLogo href="/" size="header" variant="lockup" tone="onGradient" />
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[color:var(--mk-muted)]">
              <a href="#how-it-works" className="hover:text-white">{t("how_nav_link")}</a>
              <a href="#how-it-works-coaches" className="hover:text-white">{t("how_nav_coaches")}</a>
              <Link href={MARKET_TO_PLATFORM.pricing} className="hover:text-white">{t("land_nav_pricing")}</Link>
              <Link href={MARKET_TO_PLATFORM.browse} className="hover:text-white">{t("hq_browse_coaches")}</Link>
              <Link href={signInHref()} className="hover:text-white">{t("nav_login")}</Link>
            </nav>
          </div>
          <p className="pb-8 text-center text-xs tracking-[0.16em] text-[color:var(--mk-muted)] uppercase">{t("land_footer_tag")}</p>
        </footer>
      </div>
    </div>
  );
}
