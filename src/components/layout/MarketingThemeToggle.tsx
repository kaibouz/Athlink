"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";

/** Fixed corner light/dark toggle for marketing pages (gateway, role homepages). */
export function MarketingThemeToggle() {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] sm:right-6 sm:top-5">
      <ThemeToggle className="pointer-events-auto border-white/15 bg-black/35 text-brand-100 backdrop-blur-md hover:bg-white/10 dark:border-white/15 dark:bg-black/45 dark:text-brand-100 dark:hover:bg-white/10" />
    </div>
  );
}
