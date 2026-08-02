"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Search, Send } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** Clear switcher: Search ↔ Messages ↔ Feedback (not Feed) */
export function CommSwitcher() {
  const { t } = useLocale();
  const pathname = usePathname();

  const tabs = [
    { href: "/search", label: t("comm_tab_search"), icon: Search, match: (p: string) => p.startsWith("/search") || p.startsWith("/coaches") },
    { href: "/messages", label: t("comm_tab_messages"), icon: MessageSquare, match: (p: string) => p.startsWith("/messages") },
    { href: "/coach/feedback", label: t("comm_tab_feedback"), icon: Send, match: (p: string) => p.startsWith("/coach/feedback") },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-brand-100 bg-brand-50/60 p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-4",
              active
                ? "bg-surface text-brand-800 shadow-sm"
                : "text-brand-600 hover:bg-surface/70 hover:text-brand-800",
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
