"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  Home,
  MessageSquare,
  Network,
  QrCode,
  Radar,
  Search,
  Send,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { Avatar } from "@/components/ui/Avatar";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { AppSettingsDialog } from "@/components/layout/AppSettingsPanel";
import { usePlatformPlan } from "@/components/plans/PlanComparison";
import { MARKET_TO_PLATFORM } from "@/lib/market-to-platform";
import { useLocale } from "@/lib/i18n/provider";
import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
};

function isActive(pathname: string, item: NavItem) {
  return item.match(pathname);
}

/**
 * Platform navigation as a row under the logo.
 *
 * This replaces the fixed sidebar and its drawer: on a narrow window the drawer
 * covered the page, and a row that scrolls sideways keeps every section
 * reachable without hiding the content behind it.
 */
export function AppTopNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user } = useAuth();
  const { isPro } = usePlatformPlan();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isCoach = user?.role === "coach";

  const athleteNav: NavItem[] = [
    { href: MARKET_TO_PLATFORM.athleteHome, label: t("nav_home"), icon: Home, match: (p) => p === "/home" },
    { href: "/search", label: t("nav_book"), icon: Search, match: (p) => p.startsWith("/search") || p.startsWith("/coaches") },
    { href: "/sns", label: t("nav_feed"), icon: Radar, match: (p) => p.startsWith("/sns") || p.startsWith("/feed") },
    { href: "/messages", label: t("nav_messages"), icon: MessageSquare, match: (p) => p.startsWith("/messages") },
    { href: "/progress", label: t("nav_progress"), icon: Activity, match: (p) => p.startsWith("/progress") || p.startsWith("/breakdown") },
  ];

  const coachNav: NavItem[] = [
    { href: MARKET_TO_PLATFORM.coachHome, label: t("nav_today"), icon: Home, match: (p) => p === "/coach" || p.startsWith("/coach/dashboard") },
    { href: "/coach/calendar", label: t("nav_calendar"), icon: CalendarDays, match: (p) => p.startsWith("/coach/calendar") },
    { href: "/coach/students", label: t("nav_athletes"), icon: Users, match: (p) => p.startsWith("/coach/students") },
    { href: "/messages", label: t("nav_inbox"), icon: MessageSquare, match: (p) => p.startsWith("/messages") || p.startsWith("/coach/feedback") },
    { href: "/coach/analytics", label: t("nav_earnings"), icon: CircleDollarSign, match: (p) => p.startsWith("/coach/analytics") },
  ];

  const coachTools: NavItem[] = [
    { href: "/sns", label: t("nav_scout"), icon: Radar, match: (p) => p.startsWith("/sns") },
    { href: "/search", label: t("nav_book"), icon: Search, match: (p) => p.startsWith("/search") },
    { href: "/coach/feedback", label: t("coach_nav_feedback"), icon: Send, match: (p) => p.startsWith("/coach/feedback") },
    { href: "/coach/qr", label: t("coach_nav_qr"), icon: QrCode, match: (p) => p.startsWith("/coach/qr") },
    { href: "/coach/invite", label: t("coach_nav_invite"), icon: Network, match: (p) => p.startsWith("/coach/invite") },
  ];

  const primary = isCoach ? coachNav : athleteNav;
  const secondary = isCoach ? coachTools : [];

  return (
    <>
      <AppSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <header className="app-glass-solid sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <AthlinkProLogo
            href={isCoach ? MARKET_TO_PLATFORM.coachHome : MARKET_TO_PLATFORM.athleteHome}
            size="header"
            variant="lockup"
            tone="onGradient"
            priority
          />

          <div className="flex items-center gap-1.5">
            <Link
              href={MARKET_TO_PLATFORM.pricing}
              className="hidden items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:text-brand-950 sm:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--mx-blue-2)]" />
              {/* Signed out there is no plan yet — this is just the way to pricing. */}
              {!user ? t("land_nav_pricing") : isPro ? t("plan_pro_name") : t("plan_free_name")}
            </Link>

            {user ? (
              <>
                <Link
                  href="/me"
                  className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition hover:bg-white/5"
                  aria-label={t("nav_mypage")}
                >
                  <Avatar src={user.avatarUrl} name={user.name} size={28} />
                  <span className="hidden max-w-28 truncate text-xs font-semibold text-brand-900 sm:block">
                    {user.name}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="rounded-md p-1.5 text-brand-500 transition hover:bg-white/5 hover:text-brand-900"
                  aria-label={t("me_settings")}
                >
                  <Settings className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </>
            ) : (
              <ClerkNavAuth loginLabel={t("nav_login")} compact />
            )}
            <LocaleSwitcher compact />
          </div>
        </div>

        {/* Sections, left-aligned under the logo. Below md the bottom tab bar
            (MobileNav) already carries the primary tabs, so only extras that
            aren't down there stay up here — no duplicate menus on phones. */}
        <nav
          aria-label={t("nav_menu")}
          className={cn(
            "scrollbar-none mx-auto w-full max-w-7xl items-center gap-1 overflow-x-auto border-t border-white/5 px-3 py-1.5 sm:px-5",
            secondary.length > 0 ? "flex" : "hidden md:flex",
          )}
        >
          {[...primary, ...secondary].map((item, i) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            const inBottomBar = i < primary.length;
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition",
                  inBottomBar ? "hidden md:flex" : "flex",
                  active
                    ? "app-nav-active font-semibold"
                    : "text-brand-700 hover:bg-white/5 hover:text-brand-950",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
