"use client";

import { ArrowLeftRight, BadgeCheck, MapPin } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "land_trust_item_verified", icon: BadgeCheck },
  { key: "land_trust_item_fees", icon: ArrowLeftRight },
  { key: "land_trust_item_local", icon: MapPin },
] as const satisfies readonly {
  key: MessageKey;
  icon: typeof BadgeCheck;
}[];

export function HeroTrustRow({ className }: { className?: string }) {
  const { t } = useLocale();

  return (
    <ul
      className={cn(
        "land-trust-row mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:gap-x-5",
        className,
      )}
    >
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <li key={item.key} className="contents">
            {i > 0 && (
              <span className="land-trust-dot text-brand-300/60" aria-hidden>
                ·
              </span>
            )}
            <span
              className="land-trust-item"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <Icon
                className="land-trust-icon h-3 w-3 shrink-0"
                strokeWidth={1.6}
                aria-hidden
              />
              <span>{t(item.key)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
