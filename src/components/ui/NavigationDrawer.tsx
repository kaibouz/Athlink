"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

export type NavigationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** DOM id for the drawer panel — pair with aria-controls on the trigger. */
  id?: string;
  /** Trigger that opened the drawer; receives focus when it closes. */
  triggerRef?: RefObject<HTMLButtonElement | null>;
  /** Accessible name for the scrim dismiss control. */
  scrimLabel?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Off-canvas nav panel (shadcn Sheet side="left" / Material NavigationDrawer).
 * Slides in from the left over a scrim. Locks body scroll while open,
 * closes on Escape + scrim tap, restores focus to the trigger on close.
 */
export function NavigationDrawer({
  open,
  onOpenChange,
  id,
  triggerRef,
  scrimLabel = "Close menu",
  children,
  className,
}: NavigationDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const prevBody = body.style.overflow;
    const prevHtml = documentElement.style.overflow;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBody;
      documentElement.style.overflow = prevHtml;
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Move focus into the panel on open; return it to the trigger on close
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const panel = panelRef.current;
      const focusable = panel?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      (focusable ?? panel)?.focus();
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef?.current?.focus();
    }
  }, [open, triggerRef]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
        aria-label={scrimLabel}
        onClick={close}
      />
      <nav
        ref={panelRef}
        id={id}
        tabIndex={-1}
        aria-label="Main"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] max-w-full outline-none transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        {children}
      </nav>
    </div>
  );
}

export type HamburgerButtonProps = {
  open: boolean;
  onClick: () => void;
  controlsId: string;
  label: string;
  className?: string;
  buttonRef?: RefObject<HTMLButtonElement | null>;
};

/** Three stacked lines that toggle a drawer; keeps aria-expanded in sync. */
export function HamburgerButton({
  open,
  onClick,
  controlsId,
  label,
  className,
  buttonRef,
}: HamburgerButtonProps) {
  const autoId = useId();
  const ref = buttonRef;

  return (
    <button
      ref={ref}
      type="button"
      id={autoId}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-700 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
        className,
      )}
      aria-label={label}
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={onClick}
    >
      <span className="relative block h-3.5 w-5" aria-hidden>
        <span
          className={cn(
            "absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out",
            open ? "top-[6px] rotate-45" : "top-0 rotate-0",
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-[6px] block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out",
            open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
          )}
        />
        <span
          className={cn(
            "absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out",
            open ? "top-[6px] -rotate-45" : "top-[12px] rotate-0",
          )}
        />
      </span>
    </button>
  );
}
