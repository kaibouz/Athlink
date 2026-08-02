"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function CoachSubnav() {
  const { user } = useAuth();
  const { t } = useLocale();
  const pathname = usePathname();

  if (user?.role !== "coach") return null;

  const items = [
    { href: "/coach/dashboard", label: t("nav_home") },
    { href: "/coach/calendar", label: t("coach_nav_calendar") },
    { href: "/sns", label: t("nav_sns") },
    { href: "/coach/qr", label: t("coach_nav_qr") },
    { href: "/coach/invite", label: t("coach_nav_invite") },
    { href: "/coach/feedback", label: t("comm_tab_feedback") },
  ];

  return (
    <div className="border-b border-brand-100 bg-brand-50/70">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {items.map((item) => {
          const active =
            item.href === "/coach/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
                active
                  ? "bg-surface text-brand-700 shadow-sm"
                  : "text-brand-600 hover:bg-surface/70 hover:text-brand-800",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
