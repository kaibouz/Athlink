"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Network,
  QrCode,
  Radar,
  Search,
  Send,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { getDemoCoach, pendingCoachBookings } from "@/lib/coach-bookings";
import { formatDateJa, formatPrice, cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/provider";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

export function AppSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchRole, bookings, updateBookingStatus } = useAuth();
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";
  const isCoach = user?.role === "coach";

  const athleteNav: NavItem[] = [
    { href: "/bookings", label: t("nav_home"), icon: LayoutDashboard, exact: true },
    { href: "/sns", label: t("nav_sns"), icon: Radar },
    { href: "/search", label: t("nav_find"), icon: Search },
    { href: "/messages", label: t("nav_messages"), icon: MessageSquare },
    { href: "/me", label: t("nav_mypage"), icon: User },
  ];

  const coachNav: NavItem[] = [
    { href: "/coach/dashboard", label: t("nav_home"), icon: LayoutDashboard, exact: true },
    { href: "/coach/calendar", label: t("coach_nav_calendar"), icon: CalendarDays },
    { href: "/sns", label: t("nav_sns"), icon: Radar },
    { href: "/search", label: t("comm_tab_search"), icon: Search },
    { href: "/messages", label: t("comm_tab_messages"), icon: MessageSquare },
    { href: "/coach/feedback", label: t("comm_tab_feedback"), icon: Send },
    { href: "/me", label: t("nav_mypage"), icon: User },
    { href: "/coach/qr", label: t("coach_nav_qr"), icon: QrCode },
    { href: "/coach/invite", label: t("coach_nav_invite"), icon: Network },
  ];

  const links = isCoach ? coachNav : athleteNav;

  const coach = getDemoCoach();
  const pending = isCoach ? pendingCoachBookings(bookings, coach.id) : [];
  const next = pending[0];

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  function go(href: string) {
    onClose?.();
    router.push(href);
  }

  const panel = (
    <aside className="flex h-full w-64 flex-col border-r border-brand-100 bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-brand-100 px-4">
        <Link href="/" onClick={() => onClose?.()} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">
            A
          </span>
          <span className="text-lg">
            <AthLinkMark />
          </span>
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
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-brand-700 hover:bg-brand-50 hover:text-brand-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
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

      <div className="space-y-2 border-t border-brand-100 p-3">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher compact />
        </div>
        {user ? (
          <>
            <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-2 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-lg bg-brand-100" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-900">{user.name}</p>
                <p className="text-[11px] text-brand-500">
                  {isCoach
                    ? t("role_coach")
                    : user.role === "parent"
                      ? t("role_parent")
                      : t("role_athlete")}
                </p>
              </div>
            </div>
            {isCoach ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  switchRole("athlete");
                  go("/search");
                }}
              >
                {t("role_switch_athlete")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  switchRole("coach");
                  go("/coach/dashboard");
                }}
              >
                {t("role_switch_coach")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                logout();
                onClose?.();
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              {t("nav_logout")}
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" onClick={() => onClose?.()}>
              <Button variant="ghost" size="sm" className="w-full">
                {t("nav_login")}
              </Button>
            </Link>
            <Link href="/signup" onClick={() => onClose?.()}>
              <Button size="sm" className="w-full">
                {t("nav_signup")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">{panel}</div>

      {/* Mobile drawer */}
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
