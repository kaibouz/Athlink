"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("land-reveal-in");
          io.unobserve(el);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`land-reveal ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const { t } = useLocale();
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !user) return;
    const target = user.role === "coach" ? "/coach/dashboard" : "/bookings";
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

  const panels = [
    {
      href: "/search",
      icon: Search,
      title: t("land_panel_coaches_title"),
      desc: t("land_panel_coaches_desc"),
    },
    {
      href: "/signup",
      icon: ClipboardList,
      title: t("land_panel_how_title"),
      desc: t("land_panel_how_desc"),
    },
    {
      href: "/coach/register",
      icon: UserRound,
      title: t("land_panel_coach_title"),
      desc: t("land_panel_coach_desc"),
    },
    {
      href: "/signup",
      icon: Users,
      title: t("land_panel_athlete_title"),
      desc: t("land_panel_athlete_desc"),
    },
    {
      href: "/login",
      icon: CalendarDays,
      title: t("land_panel_tools_title"),
      desc: t("land_panel_tools_desc"),
    },
  ] as const;

  return (
    <div className="landing-page">
      <header className="landing-sticky-header landing-hero-bg sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="text-lg" aria-label="AthLink">
            <AthLinkMark />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-800 hover:bg-white/50 sm:inline"
            >
              {t("nav_login")}
            </Link>
            <Link href="/signup">
              <Button size="sm" className="btn-landing-primary border-0 shadow-none">
                {t("land_get_started")}
              </Button>
            </Link>
            <ThemeToggle />
            <LocaleSwitcher compact />
          </div>
        </div>
      </header>

      <section className="landing-hero-bg relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 pb-16 text-center sm:px-6">
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="land-fade text-xs font-semibold tracking-[0.14em] text-brand-500 uppercase sm:text-sm">
            {t("hero_sport_label")}
            <span className="mx-1.5 text-brand-300">·</span>
            {t("hero_locations")}
          </p>
          <h1 className="land-fade land-fade-delay-1 land-title-shadow mt-5">
            <AthLinkMark size="hero" />
          </h1>
          <p className="land-fade land-fade-delay-2 mx-auto mt-5 max-w-xl text-base font-medium leading-snug text-brand-800 sm:text-lg">
            {t("hero_tagline")}
          </p>
          <p className="land-fade land-fade-delay-3 mt-4 text-xs font-medium tracking-wide text-brand-500 sm:text-sm">
            {t("land_trust_compact")}
          </p>
        </div>
        <a
          href="#explore"
          className="land-fade land-fade-delay-4 absolute bottom-8 left-1/2 z-10 inline-flex -translate-x-1/2 flex-col items-center gap-1 text-xs font-semibold tracking-wide text-brand-600 uppercase"
        >
          {t("land_scroll_hint")}
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </section>

      <div id="explore" className="mx-auto max-w-3xl space-y-5 px-4 py-16 sm:px-6 sm:py-24">
        {panels.map((panel) => {
          const Icon = panel.icon;
          return (
            <Reveal key={panel.title}>
              <Link
                href={panel.href}
                className="group flex items-start gap-4 rounded-2xl border border-brand-100/80 bg-surface/90 px-5 py-6 shadow-sm transition hover:border-brand-300 hover:bg-white hover:shadow-md sm:gap-5 sm:px-7 sm:py-8"
              >
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block font-brand text-xl font-extrabold tracking-tight text-brand-950 sm:text-2xl">
                    {panel.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-brand-600 sm:text-base">
                    {panel.desc}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 group-hover:text-brand-800">
                    {t("land_panel_cta")}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <footer className="border-t border-brand-100 bg-ink text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="text-lg text-white">
              <AthLinkMark
                athClassName="text-white"
                linkClassName="text-[var(--athlink-link-hero)]"
              />
            </div>
            <p className="mt-2 max-w-md text-sm text-slate-400">{t("land_footer_tag")}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/search" className="hover:text-white">
              {t("footer_find")}
            </Link>
            <Link href="/coach/register" className="hover:text-white">
              {t("footer_register")}
            </Link>
            <Link href="/dns" className="hover:text-white">
              {t("land_footer_dns")}
            </Link>
            <Link href="/login" className="hover:text-white">
              {t("nav_login")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
