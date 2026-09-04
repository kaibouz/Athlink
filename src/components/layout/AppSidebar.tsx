"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  Check,
  CircleDollarSign,
  Home,
  MessageSquare,
  Network,
  Activity,
  QrCode,
  Radar,
  Search,
  Send,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { pendingCoachBookings } from "@/lib/coach-bookings";
import { useMyCoach } from "@/lib/use-my-coach";
import { formatDateJa, formatPrice, cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { ClerkNavAuth } from "@/components/layout/ClerkNavAuth";
import { Button } from "@/components/ui/Button";
import { AppSettingsDialog } from "@/components/layout/AppSettingsPanel";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  match?: (p: string) => boolean;
};

function isActive(pathname: string, item: NavItem) {
  if (item.match) return item.match(pathname);
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, bookings, updateBookingStatus } = useAuth();
  const { t, locale } = useLocale();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const isCoach = user?.role === "coach";

  const athleteNav: NavItem[] = [
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

  const coachNav: NavItem[] = [
    {
      href: "/coach/dashboard",
      label: t("nav_today"),
      icon: Home,
      match: (p) =>
        p === "/coach" ||
        p.startsWith("/coach/dashboard") ||
        p.startsWith("/coach/register"),
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

  const coachTools: NavItem[] = [
    { href: "/sns", label: t("nav_feed"), icon: Radar },
    { href: "/search", label: t("nav_book"), icon: Search },
    { href: "/coach/feedback", label: t("coach_nav_feedback"), icon: Send },
    { href: "/coach/qr", label: t("coach_nav_qr"), icon: QrCode },
    { href: "/coach/invite", label: t("coach_nav_invite"), icon: Network },
  ];

  const links = isCoach ? coachNav : athleteNav;

  const { coach } = useMyCoach();
  const pending = isCoach ? pendingCoachBookings(bookings, coach?.id) : [];
  const next = pending[0];
  const onMyPage = pathname === "/me" || pathname.startsWith("/me/");
  const homeHref = isCoach ? "/coach/dashboard" : "/home";

  const panel = (
    <aside className="app-glass-solid flex h-full w-64 flex-col border-r border-white/10">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <Link href={homeHref} onClick={() => onClose?.()} className="inline-flex shrink-0">
          <AthlinkProLogo href={null} size="header" variant="monogram" tone="onGradient" />
        </Link>
        {onClose && (
          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-brand-600 hover:bg-brand-50 md:hidden"
            onClick={onClose}
            aria-label={t("nav_menu")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "app-nav-active font-semibold"
                  : "text-brand-700 hover:bg-brand-50/80 hover:text-brand-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {isCoach ? (
          <div className="mt-4 space-y-1 border-t border-white/10 pt-3">
            <p className="px-3 pb-1 text-[10px] font-semibold tracking-wide text-brand-500 uppercase">
              Tools
            </p>
            {coachTools.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item);
              return (
                <Link
                  key={`tool-${item.href}`}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "app-nav-active font-semibold"
                      : "text-brand-600 hover:bg-brand-50/80 hover:text-brand-900",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </nav>

      {isCoach && (
        <div className="border-t border-brand-100 bg-ink p-3 text-white">
          <p className="text-[10px] font-semibold tracking-wide text-sky-300 uppercase">
            {t("quickbar_label")}
          </p>
          {next ? (
            <>
              <p className="mt-1 line-clamp-2 text-xs text-slate-200">
                {t("quickbar_pending", { count: pending.length })} — {next.athleteName}
                <br />
                {formatDateJa(next.date, dateLocale)} {next.startTime} · {formatPrice(next.price)}
              </p>
              <div className="mt-2 flex gap-1.5">
                <Button
                  size="sm"
                  className="h-8 flex-1 bg-emerald-500 px-2 text-xs text-white hover:bg-emerald-400"
                  onClick={() => updateBookingStatus(next.id, "confirmed")}
                >
                  <Check className="h-3.5 w-3.5" />
                  {t("quickbar_confirm")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1 border-white/30 bg-transparent px-2 text-xs text-white hover:bg-white/10"
                  onClick={() => updateBookingStatus(next.id, "cancelled")}
                >
                  <X className="h-3.5 w-3.5" />
                  {t("quickbar_decline")}
                </Button>
              </div>
            </>
          ) : (
            <p className="mt-1 text-xs text-slate-400">{t("quickbar_clear")}</p>
          )}
        </div>
      )}

      <div className="border-t border-white/10 p-2">
        {user ? (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2 transition",
              onMyPage ? "bg-brand-50" : "hover:bg-brand-50/80",
            )}
          >
            <Link
              href="/me"
              onClick={() => onClose?.()}
              aria-current={onMyPage ? "page" : undefined}
              className="flex min-w-0 flex-1 items-center gap-2.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatarUrl}
                alt=""
                className={cn(
                  "h-7 w-7 shrink-0 rounded-full bg-brand-200 object-cover",
                  onMyPage && "ring-2 ring-brand-400 ring-offset-1",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] leading-tight font-medium text-brand-900">
                  {user.name}
                </p>
                <p className="truncate text-[11px] leading-tight text-brand-500">
                  {onMyPage
                    ? t("nav_mypage")
                    : isCoach
                      ? t("role_coach")
                      : user.role === "parent"
                        ? t("role_parent")
                        : t("role_athlete")}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="shrink-0 rounded-md p-1 text-brand-400 transition hover:bg-brand-100 hover:text-brand-700"
              aria-label={t("me_settings")}
            >
              <Settings className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <ClerkNavAuth loginLabel={t("nav_login")} />
        )}
      </div>
    </aside>
  );

  return (
    <>
      <AppSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">{panel}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label={t("nav_menu")}
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">{panel}</div>
        </div>
      )}
    </>
  );
}
