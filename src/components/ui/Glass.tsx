import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Soft contrast veil for text over vivid / photo backdrops. */
  scrim?: boolean;
  /** Slightly denser fill for dense UI (forms, tables). */
  dense?: boolean;
  as?: "div" | "section" | "article" | "aside";
};

/**
 * Glassmorphism content surface — decorative skin for cards and panels
 * (not Liquid Glass: glass is allowed on content, not only floating chrome).
 */
export function GlassPanel({
  children,
  className,
  scrim = false,
  dense = false,
  as: Tag = "div",
  ...props
}: GlassPanelProps) {
  return (
    <Tag
      className={cn(
        "glass-panel",
        dense && "glass-panel-dense",
        scrim && "glass-panel-scrim",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

type GlassSceneProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Optional photographic / gradient bleed layer (CSS var or class). */
  atmosphereClassName?: string;
};

/**
 * Flexible backdrop host — colors/imagery stay swappable via CSS variables
 * (`--glass-scene-image`, `--glass-scene-wash`) or `atmosphereClassName`.
 */
export function GlassScene({
  children,
  className,
  atmosphereClassName,
  ...props
}: GlassSceneProps) {
  return (
    <div className={cn("glass-scene", className)} {...props}>
      <div className={cn("glass-scene-atmosphere", atmosphereClassName)} aria-hidden />
      <div className="glass-scene-scrim" aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
