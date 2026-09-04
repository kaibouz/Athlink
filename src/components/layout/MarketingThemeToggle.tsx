"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

/** Inline light/dark toggle for marketing / chrome headers (next to locale). */
export function MarketingThemeToggle({ className }: { className?: string }) {
  return (
    <ThemeToggle
      className={cn(
        "border-brand-200/80 bg-surface/90 text-brand-800 shadow-sm backdrop-blur-sm hover:bg-brand-50 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
        className,
      )}
    />
  );
}
