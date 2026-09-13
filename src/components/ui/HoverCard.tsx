"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";

/** Open after a short intentional pause (hover or focus). */
export const HOVER_CARD_OPEN_DELAY_MS = 400;
/** Keep open briefly so the pointer can cross into the card. */
export const HOVER_CARD_CLOSE_DELAY_MS = 200;

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;
export const HoverCardPortal = HoverCardPrimitive.Portal;

export const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 8, ...props }, ref) => (
  <HoverCardPortal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 origin-[var(--radix-hover-card-content-transform-origin)] rounded-2xl border border-brand-100 bg-surface p-4 text-brand-950 shadow-lg outline-none",
        "data-[state=open]:animate-[hover-card-in_180ms_ease-out]",
        "data-[state=closed]:animate-[hover-card-out_160ms_ease-in]",
        className,
      )}
      {...props}
    />
  </HoverCardPortal>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;
