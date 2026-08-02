"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const links =
    user?.role === "coach"
      ? [
          { href: "/coach/dashboard", label: t("nav_home") },
          { href: "/coach/calendar", label: t("coach_nav_calendar") },
          { href: "/sns", label: t("nav_sns") },
          { href: "/coach/qr", label: t("coach_nav_qr") },
          { href: "/coach/invite", label: t("coach_nav_invite") },
          { href: "/coach/feedback", label: t("comm_tab_feedback") },
          { href: "/me", label: t("nav_mypage") },
        ]
      : [
          { href: "/sns", label: t("nav_sns") },
          { href: "/search", label: t("nav_find") },
          { href: "/bookings", label: t("nav_bookings") },
          { href: "/messages", label: t("nav_messages") },
          { href: "/me", label: t("nav_mypage") },
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">
            A
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-950">
            Ath<span className="text-brand-600">Link</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-brand-600 hover:bg-brand-50 hover:text-brand-800",
              )}
            >
              {link.label}
            </Link>
          ))}
          {user?.role !== "coach" && (
            <Link
              href="/coach/register"
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/coach")
                  ? "bg-brand-50 text-brand-700"
                  : "text-brand-600 hover:bg-brand-50 hover:text-brand-800",
              )}
            >
              {t("nav_coach_register")}
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <LocaleSwitcher />
          {user ? (
            <>
              <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                {user.role === "coach"
                  ? t("role_coach")
                  : user.role === "parent"
                    ? t("role_parent")
                    : t("role_athlete")}
              </span>
              {user.role !== "coach" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    switchRole("coach");
                    router.push("/coach/students");
                  }}
                >
                  {t("role_switch_coach")}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    switchRole("athlete");
                    router.push("/search");
                  }}
                >
                  {t("role_switch_athlete")}
                </Button>
              )}
              <Link
                href={user.role === "coach" ? "/coach/dashboard" : "/bookings"}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-brand-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-lg bg-brand-100" />
                <span className="text-sm font-medium text-brand-800">{user.name}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                aria-label={t("nav_logout")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("nav_login")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">{t("nav_signup")}</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <LocaleSwitcher compact />
          <button
            className="rounded-lg p-2 text-brand-700 hover:bg-brand-50"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav_menu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brand-100 bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {(user?.role === "coach"
              ? links
              : [...links, { href: "/coach/register", label: t("nav_coach_register") }]
            ).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  {link.label}
                </Link>
              ))}
            {user && user.role !== "coach" && (
              <button
                onClick={() => {
                  switchRole("coach");
                  setOpen(false);
                  router.push("/coach/students");
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                {t("role_switch_coach")}
              </button>
            )}
            {user?.role === "coach" && (
              <button
                onClick={() => {
                  switchRole("athlete");
                  setOpen(false);
                  router.push("/search");
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                {t("role_switch_athlete")}
              </button>
            )}
            <div className="my-2 border-t border-brand-100" />
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  router.push("/");
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                {t("nav_logout")}（{user.name}）
              </button>
            ) : (
              <>
                <Link
                  href="/login?role=coach"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                >
                  {t("login_quick_coach")}
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                >
                  {t("nav_signup")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
