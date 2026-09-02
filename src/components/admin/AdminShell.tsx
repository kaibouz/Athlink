"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Flag,
  LayoutDashboard,
  Mail,
  Menu,
  ScrollText,
  Settings,
  Shield,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  exact?: boolean;
};

export function AdminShell({
  user,
  badges = {},
  children,
}: {
  user: User;
  badges?: Partial<Record<string, number>>;
  children: React.ReactNode;
}) {
  const { t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav: NavItem[] = [
    { href: "/admin", labelKey: "admin_nav_overview", icon: LayoutDashboard, exact: true },
    {
      href: "/admin/errors",
      labelKey: "admin_nav_errors",
      icon: AlertTriangle,
      badge: badges.errors,
    },
    { href: "/admin/coaches", labelKey: "admin_nav_coaches", icon: Users, badge: badges.coaches },
    { href: "/admin/athletes", labelKey: "admin_nav_athletes", icon: Users },
    {
      href: "/admin/bookings",
      labelKey: "admin_nav_bookings",
      icon: Wallet,
      badge: badges.bookings,
    },
    { href: "/admin/ai", labelKey: "admin_nav_ai", icon: Bot, badge: badges.ai },
    { href: "/admin/messaging", labelKey: "admin_nav_messaging", icon: Mail },
    { href: "/admin/moderation", labelKey: "admin_nav_moderation", icon: Shield },
    { href: "/admin/config", labelKey: "admin_nav_config", icon: Settings },
    { href: "/admin/audit", labelKey: "admin_nav_audit", icon: ScrollText },
    { href: "/admin/users", labelKey: "admin_users", icon: Flag },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/admin/login");
  }

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <ul className="space-y-0.5">
        {nav.map(({ href, labelKey, icon: Icon, badge, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-gradient-to-r from-[#3b6ef6]/25 to-[#22c7e0]/10 text-[var(--admin-text)]"
                    : "text-[var(--admin-text-dim)] hover:bg-white/[0.04] hover:text-[var(--admin-text)]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{t(labelKey as never)}</span>
                {badge && badge > 0 ? (
                  <span className="rounded-full bg-[#ff5f6d] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="admin-console flex min-h-screen text-[var(--admin-text)]">
      <aside className="admin-sidebar app-glass-solid hidden w-[232px] shrink-0 flex-col border-r border-[var(--admin-border)] lg:flex">
        <div className="border-b border-[var(--admin-border)] px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-base">
              <AthLinkMark athClassName="text-[var(--admin-text)]" linkClassName="text-sky-300" />
            </span>
          </Link>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-dim)]">
            Executive
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </nav>
        <div className="border-t border-[var(--admin-border)] p-3 text-xs text-[var(--admin-text-dim)]">
          {user.name}
        </div>
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="app-glass-solid absolute left-0 top-0 flex h-full w-[232px] flex-col shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-4">
              <span className="font-semibold">Menu</span>
              <button type="button" onClick={() => setDrawerOpen(false)} className="admin-btn-ghost p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="app-glass-solid sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="admin-btn-ghost p-2 lg:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Activity className="hidden h-4 w-4 text-[var(--admin-text-dim)] sm:block" />
            <span className="hidden text-sm text-[var(--admin-text-dim)] sm:inline">{t("admin_title")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="admin-btn-ghost hidden text-sm sm:inline">
              {t("admin_back_site")}
            </Link>
            <LocaleSwitcher compact />
            <button type="button" onClick={() => void logout()} className="admin-btn-ghost text-sm">
              {t("admin_logout")}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
