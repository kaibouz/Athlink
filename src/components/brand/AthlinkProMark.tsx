"use client";

import { cn } from "@/lib/utils";

/**
 * AthlinkPro wordmark aligned to official logo:
 * wide tracking, ATHLINK + PRO, mint → sky/lavender shimmer.
 */
export function AthlinkProMark({
  className,
  baseClassName,
  proClassName,
  variant = "default",
  size = "default",
  animated = false,
}: {
  className?: string;
  baseClassName?: string;
  proClassName?: string;
  /** default = UI surfaces; hero = on black / dark canvas */
  variant?: "default" | "hero";
  size?: "default" | "hero";
  /** soft mint→sky shimmer on Pro (landing hero) */
  animated?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-brand uppercase tracking-[0.12em]",
        size === "hero"
          ? "text-[clamp(2.4rem,9vw,5.25rem)] leading-none font-extrabold"
          : "text-sm font-black tracking-[0.16em] sm:text-base",
        className,
      )}
    >
      <span
        className={cn(
          variant === "hero" ? "text-white" : "text-[var(--athlink-ath)]",
          baseClassName,
        )}
      >
        Athlink
      </span>
      <span
        className={cn(
          !animated &&
            (variant === "hero"
              ? "bg-gradient-to-r from-[#b8e8d4] to-[#b8c8f0] bg-clip-text text-transparent"
              : "text-[var(--athlink-link)]"),
          animated && "athlink-logo-shimmer",
          proClassName,
        )}
      >
        Pro
      </span>
    </span>
  );
}
