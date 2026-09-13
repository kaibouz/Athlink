"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type ReactElement,
} from "react";
import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  HOVER_CARD_CLOSE_DELAY_MS,
  HOVER_CARD_OPEN_DELAY_MS,
} from "@/components/ui/HoverCard";
import { cn } from "@/lib/utils";

export type ProfileHoverPreview = {
  href: string;
  name: string;
  avatarUrl?: string;
  /** School · position · class year, coach specialty, etc. */
  subtitle?: string;
  /** Short bio / summary line. */
  summary?: string;
  badges?: string[];
};

type ProfileHoverCardProps = {
  profile: ProfileHoverPreview;
  children: ReactElement;
  className?: string;
  openDelay?: number;
  closeDelay?: number;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Linked-profile preview via Radix HoverCard.
 * Opens from pointer hover and keyboard focus after a short delay,
 * stays open while the pointer moves into the card, and reverses
 * opacity/transform on exit.
 */
export function ProfileHoverCard({
  profile,
  children,
  className,
  openDelay = HOVER_CARD_OPEN_DELAY_MS,
  closeDelay = HOVER_CARD_CLOSE_DELAY_MS,
}: ProfileHoverCardProps) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const labelId = useId();

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const scheduleOpen = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), openDelay);
  }, [openDelay]);

  const scheduleClose = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay]);

  function onTriggerFocus(e: FocusEvent) {
    // Pointer focus is already handled by HoverCard hover; only keyboard.
    if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) {
      scheduleOpen();
    }
  }

  function onTriggerBlur(e: FocusEvent) {
    const next = e.relatedTarget;
    if (next instanceof Node && e.currentTarget.contains(next)) return;
    scheduleClose();
  }

  return (
    <HoverCard
      open={open}
      onOpenChange={setOpen}
      openDelay={openDelay}
      closeDelay={closeDelay}
    >
      <HoverCardTrigger asChild onFocus={onTriggerFocus} onBlur={onTriggerBlur}>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        className={cn(className)}
        aria-labelledby={labelId}
        onPointerEnter={() => {
          clearTimers();
          setOpen(true);
        }}
        onPointerLeave={scheduleClose}
        onFocusCapture={() => {
          clearTimers();
          setOpen(true);
        }}
        onBlurCapture={(e) => {
          const next = e.relatedTarget;
          if (next instanceof Node && e.currentTarget.contains(next)) return;
          scheduleClose();
        }}
      >
        <div className="flex gap-3">
          <Link
            href={profile.href}
            className="shrink-0 rounded-full outline-none ring-brand-500/40 focus-visible:ring-2"
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full bg-brand-50 object-cover"
              />
            ) : (
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
                aria-hidden
              >
                {initials(profile.name)}
              </span>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              id={labelId}
              href={profile.href}
              className="block truncate font-bold text-brand-950 outline-none hover:text-brand-600 focus-visible:underline"
            >
              {profile.name}
            </Link>
            {profile.subtitle ? (
              <p className="mt-0.5 truncate text-xs text-brand-500">{profile.subtitle}</p>
            ) : null}
            {profile.summary ? (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-brand-700">
                {profile.summary}
              </p>
            ) : null}
            {profile.badges && profile.badges.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {profile.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
