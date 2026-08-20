"use client";

import { cn } from "@/lib/utils";

/** AthLink wordmark — Manrope brand face, theme-aware “Link” contrast */
export function AthLinkMark({
  className,
  athClassName,
  linkClassName,
  variant = "default",
  size = "default",
  animated = false,
}: {
  className?: string;
  athClassName?: string;
  linkClassName?: string;
  /** default = light/dark UI surfaces; hero = always on dark blue gradient */
  variant?: "default" | "hero";
  /** hero = giant landing wordmark (only h1 on the home viewport) */
  size?: "default" | "hero";
  /** soft color shimmer on Link (landing hero) */
  animated?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-brand tracking-tight",
        size === "hero"
          ? "text-[clamp(3rem,12vw,6.5rem)] leading-none font-extrabold"
          : "font-black",
        className,
      )}
    >
      <span
        className={cn(
          variant === "hero" ? "text-white" : "text-[var(--athlink-ath)]",
          athClassName,
        )}
      >
        Ath
      </span>
      <span
        className={cn(
          !animated &&
            (variant === "hero" ? "text-[var(--athlink-link-hero)]" : "text-[var(--athlink-link)]"),
          animated && "athlink-link-shimmer",
          linkClassName,
        )}
      >
        Link
      </span>
    </span>
  );
}
