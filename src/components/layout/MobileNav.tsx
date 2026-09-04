"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  Home,
  MessageSquare,
  Radar,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { showsAppTabBar } from "@/lib/route-layer";

type Tab = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (p: string) => boolean;
};

/** Mobile concept tabs — athlete: Home/Book/Feed/Messages/Progress; coach: Today/Calendar/Athletes/Messages/Earnings */
export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLocale();

  // Athlete/coach tabs are platform chrome — never marketing, auth or admin.
  if (!user || !showsAppTabBar(pathname)) {
    return null;
  }

  const coachTabs: Tab[] = [
    {
      href: "/coach/dashboard",
      label: t("nav_today"),
      icon: Home,
      match: (p) =>
        p === "/coach" ||
        p.startsWith("/coach/dashboard") ||
        p.startsWith("/coach/register") ||
        p.startsWith("/coach/qr") ||
        p.startsWith("/coach/invite"),
    },
    {
      href: "/coach/calendar",
      label: t("nav_calendar"),
      icon: CalendarDays,
      match: (p) => p.startsWith("/coach/calendar"),
    },
    {
      href: "/coach/students",
      label: t("nav_athletes"),
      icon: Users,
      match: (p) => p.startsWith("/coach/students"),
    },
    {
      href: "/messages",
      label: t("nav_messages"),
      icon: MessageSquare,
      match: (p) => p.startsWith("/messages") || p.startsWith("/coach/feedback"),
    },
    {
      href: "/coach/analytics",
      label: t("nav_earnings"),
      icon: CircleDollarSign,
      match: (p) => p.startsWith("/coach/analytics"),
    },
  ];

  const athleteTabs: Tab[] = [
    {
      href: "/home",
      label: t("nav_home"),
      icon: Home,
      match: (p) => p === "/home" || p.startsWith("/home/") || p.startsWith("/bookings"),
    },
    {
      href: "/search",
      label: t("nav_book"),
      icon: Search,
      match: (p) => p.startsWith("/search") || p.startsWith("/coaches"),
    },
    {
      href: "/sns",
      label: t("nav_feed"),
      icon: Radar,
      match: (p) => p.startsWith("/sns") || p.startsWith("/feed") || p.startsWith("/athletes"),
    },
    {
      href: "/messages",
      label: t("nav_messages"),
      icon: MessageSquare,
      match: (p) => p.startsWith("/messages"),
    },
    {
      href: "/progress",
      label: t("nav_progress"),
      icon: Activity,
      match: (p) => p === "/progress" || p.startsWith("/progress/"),
    },
  ];

  const items = user.role === "coach" ? coachTabs : athleteTabs;

  return (
    <nav className="app-glass-solid fixed inset-x-0 bottom-0 z-40 border-t border-white/10 backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-[52px] max-w-lg items-center justify-around px-1">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium",
                active ? "text-[color:var(--mx-blue-2)]" : "text-brand-400",
              )}
            >
              <Icon className={cn("h-[22px] w-[22px]", active && "stroke-[2.5]")} />
              <span className="truncate max-w-[4.5rem]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
