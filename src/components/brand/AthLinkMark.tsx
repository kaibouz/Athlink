"use client";

import { cn } from "@/lib/utils";

/** AthLink wordmark with theme-aware “Link” contrast */
export function AthLinkMark({
  className,
  athClassName,
  linkClassName,
  variant = "default",
  size = "default",
}: {
  className?: string;
  athClassName?: string;
  linkClassName?: string;
  /** default = light/dark UI surfaces; hero = always on dark blue gradient */
  variant?: "default" | "hero";
  /** hero = giant landing wordmark */
  size?: "default" | "hero";
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
          variant === "hero" ? "text-[var(--athlink-link-hero)]" : "text-[var(--athlink-link)]",
          linkClassName,
        )}
      >
        Link
      </span>
    </span>
  );
}
