"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Radar, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";

type Tab = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (p: string) => boolean;
};

/** 5 tabs. My Athletes lives on Home (dashboard). SNS = timeline + scout. */
export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLocale();

  if (
    !user ||
    pathname === "/" ||
    pathname === "/for-athletes" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/ios"
  ) {
    return null;
  }

  const coachTabs: Tab[] = [
    {
      href: "/coach/dashboard",
      label: t("nav_home"),
      icon: Home,
      match: (p) =>
        p.startsWith("/coach/dashboard") ||
        p.startsWith("/coach/students") ||
        p.startsWith("/coach/calendar") ||
        p.startsWith("/coach/qr") ||
        p.startsWith("/coach/invite") ||
        p.startsWith("/coach/register"),
    },
    {
      href: "/sns",
      label: t("nav_sns"),
      icon: Radar,
      match: (p) => p.startsWith("/sns") || p.startsWith("/feed") || p.startsWith("/athletes"),
    },
    {
      href: "/search",
      label: t("comm_tab_search"),
      icon: Search,
      match: (p) => p.startsWith("/search") || p.startsWith("/coaches"),
    },
    {
      href: "/messages",
      label: t("comm_tab_messages"),
      icon: MessageSquare,
      match: (p) => p.startsWith("/messages") || p.startsWith("/coach/feedback"),
    },
    {
      href: "/me",
      label: t("nav_mypage"),
      icon: User,
      match: (p) => p === "/me" || p.startsWith("/me/"),
    },
  ];

  const athleteTabs: Tab[] = [
    {
      href: "/bookings",
      label: t("nav_home"),
      icon: Home,
      match: (p) => p.startsWith("/bookings"),
    },
    {
      href: "/sns",
      label: t("nav_sns"),
      icon: Radar,
      match: (p) => p.startsWith("/sns") || p.startsWith("/feed") || p.startsWith("/athletes"),
    },
    {
      href: "/search",
      label: t("nav_search_short"),
      icon: Search,
      match: (p) => p.startsWith("/search") || p.startsWith("/coaches"),
    },
    {
      href: "/messages",
      label: t("nav_messages"),
      icon: MessageSquare,
      match: (p) => p.startsWith("/messages"),
    },
    {
      href: "/me",
      label: t("nav_mypage"),
      icon: User,
      match: (p) => p === "/me" || p.startsWith("/me/"),
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
                active ? "text-brand-600" : "text-brand-400",
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
