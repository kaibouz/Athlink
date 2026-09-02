"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  ClipboardList,
  Handshake,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { CoachProfile } from "@/types";
import { coaches as staticCoaches } from "@/lib/data";
import { joinPathFor, shouldEnterOnboarding, destinationFor } from "@/lib/onboarding";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { CoachCard } from "@/components/coaches/CoachCard";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { HeroCoastline } from "@/components/landing/HeroCoastline";
import { LandingSplash } from "@/components/landing/LandingSplash";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export default function HomePage() {
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const [featured, setFeatured] = useState<CoachProfile[]>(
    staticCoaches.filter((c) => c.verified).slice(0, 3),
  );
  const [intro, setIntro] = useState<"pending" | "crossfade" | "ready">("pending");

  useEffect(() => {
    void fetch("/api/coaches")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { coaches?: CoachProfile[] } | null) => {
        const list = data?.coaches?.filter((c) => c.verified) ?? [];
        if (list.length > 0) setFeatured(list.slice(0, 3));
      })
      .catch(() => {
        /* keep static fallback */
      });
  }, []);

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

  const howSteps = [
    { n: "1", icon: ClipboardList, title: t("land_how_1_title"), desc: t("land_how_1_desc") },
    { n: "2", icon: Handshake, title: t("land_how_2_title"), desc: t("land_how_2_desc") },
    { n: "3", icon: Sparkles, title: t("land_how_3_title"), desc: t("land_how_3_desc") },
  ];

  const whyItems = [
    { icon: CalendarDays, title: t("land_why_sched_title"), desc: t("land_why_sched_desc") },
    { icon: Wallet, title: t("land_why_pay_title"), desc: t("land_why_pay_desc") },
    { icon: Users, title: t("land_why_client_title"), desc: t("land_why_client_desc") },
    { icon: Bot, title: t("land_why_ai_title"), desc: t("land_why_ai_desc") },
  ];

  return (
    <div className="landing-page">
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

        <section className="relative z-10 mx-auto max-w-4xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-16 sm:pb-20">
          <p className="land-fade text-xs font-semibold tracking-[0.14em] text-brand-500 uppercase sm:text-sm">
            {t("hero_sport_label")}
            <span className="mx-1.5 text-brand-300">·</span>
            {t("hero_locations")}
          </p>
          <h1 className="land-fade land-fade-delay-1 mt-5">
            <AthLinkMark size="hero" athClassName="text-brand-950" animated />
          </h1>
          <p className="land-fade land-fade-delay-2 mx-auto mt-5 max-w-xl text-base font-medium leading-snug text-brand-800 sm:text-lg">
            {t("hero_tagline")}
          </p>
          <div className="land-fade land-fade-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/join" className="group">
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
        <p className="pb-4 text-center text-sm font-bold tracking-wide">
          {t("land_band_tag")}
        </p>
      </div>

      <section id="how" className="relative overflow-hidden py-16 sm:py-20">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/baseball-pitch.jpg"
          aria-hidden
        >
          <source src="/videos/baseball-pitch.mp4" type="video/mp4" />
        </video>
        <div className="land-video-wash absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="land-title-plate mx-auto max-w-2xl rounded-2xl px-4 py-5 text-center">
            <h2 className="font-brand text-3xl tracking-tight text-white drop-shadow-sm sm:text-4xl">
              {t("land_how_title")}
            </h2>
            <p className="mt-2 text-white/90 drop-shadow-sm">{t("land_how_sub")}</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/85 drop-shadow-sm">
              {t("hero_body")}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {howSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.n}
                  className="rounded-2xl border border-white/12 bg-white/10 p-6 backdrop-blur-md dark:border-white/15 dark:bg-black/25"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-black text-white">
                      {step.n}
                    </span>
                    <Icon className="h-5 w-5 text-sky-200" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{step.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-brand text-3xl tracking-tight text-brand-950 sm:text-4xl">
                {t("land_meet_title")}
              </h2>
              <p className="mt-2 text-brand-600">{t("land_meet_sub")}</p>
            </div>
            <Link
              href="/search"
              className="text-sm font-bold text-brand-600 underline-offset-4 hover:underline"
            >
              {t("featured_see_all")}
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((coach) => (
              <CoachCard key={coach.id} coach={coach} variant="landing" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-center font-brand text-3xl tracking-tight text-brand-950 sm:text-4xl">
          {t("land_why_title")}
        </h2>
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-brand text-3xl tracking-tight text-brand-950 sm:text-4xl">
              {t("land_split_title")}
            </h2>
            <p className="mt-2 text-brand-600">{t("land_split_sub")}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="land-panel join-card-coach rounded-2xl p-6 sm:p-8">
              <UserRound className="h-7 w-7 text-brand-600" />
              <h3 className="mt-3 text-xl font-black text-brand-950">
                {t("land_split_coach_title")}
              </h3>
              <p className="mt-1 font-semibold text-brand-700">{t("land_split_coach_lead")}</p>
              <ul className="mt-4 space-y-2 text-sm text-brand-700">
                <li>· {t("land_split_coach_1")}</li>
                <li>· {t("land_split_coach_2")}</li>
                <li>· {t("land_split_coach_3")}</li>
              </ul>
              <Link href="/join/coach" className="group mt-6 inline-block">
                <Button className="btn-landing-primary border-0">
                  {t("hero_cta_coach")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </article>
            <article className="land-panel join-card-athlete rounded-2xl p-6 sm:p-8">
              <Users className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              <h3 className="mt-3 text-xl font-black text-brand-950">
                {t("land_split_athlete_title")}
              </h3>
              <p className="mt-1 font-semibold text-brand-700">{t("land_split_athlete_lead")}</p>
              <ul className="mt-4 space-y-2 text-sm text-brand-700">
                <li>· {t("land_split_athlete_1")}</li>
                <li>· {t("land_split_athlete_2")}</li>
                <li>· {t("land_split_athlete_3")}</li>
              </ul>
              <Link href="/for-athletes" className="group mt-6 inline-block">
                <Button className="btn-athlete-primary border-0 font-bold">
                  {t("nav_signup")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </article>
          </div>
        </div>
      </section>

      <footer className="land-footer border-t border-brand-200/20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <div className="text-lg">
              <AthLinkMark athClassName="text-brand-950" linkClassName="text-brand-700" />
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand-600">
              {t("land_footer_tag")}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-brand-950">{t("footer_product")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-brand-600">
              <li>
                <a href="#how" className="hover:text-brand-800">
                  {t("land_how_title")}
                </a>
              </li>
              <li>
                <Link href="/search" className="hover:text-brand-800">
                  {t("footer_find")}
                </Link>
              </li>
              <li>
                <Link href="/coach/register" className="hover:text-brand-800">
                  {t("footer_register")}
                </Link>
              </li>
              <li>
                <Link href="/dns" className="hover:text-brand-800">
                  {t("land_footer_dns")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-brand-950">{t("footer_support")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-brand-600">
              <li>
                <Link href="/login" className="hover:text-brand-800">
                  {t("nav_login")}
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-brand-800">
                  {t("nav_signup")}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-800">
                  {t("nav_admin")}
                </Link>
              </li>
              <li className="text-brand-500">© 2026 AthLink</li>
            </ul>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
