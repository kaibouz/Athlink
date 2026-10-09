"use client";

import { useEffect, useState } from "react";
import { Apple, ArrowRight, Play, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  ANDROID_APP_URL,
  IOS_APP_URL,
  detectPlatform,
  hasAnyStoreLink,
  storeUrlFor,
  type MobilePlatform,
} from "@/lib/app-stores";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * One button into the native app. It resolves to the visitor's own store, and
 * while nothing is published it says so rather than linking somewhere dead.
 */
export function GetTheAppCta({ className }: { className?: string }) {
  const { t } = useLocale();
  const [platform, setPlatform] = useState<MobilePlatform>("other");

  useEffect(() => {
    // After paint: the server render has no navigator, so the platform-specific
    // store link can only be resolved on the client.
    const raf = requestAnimationFrame(() => setPlatform(detectPlatform()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const href = storeUrlFor(platform);
  const live = hasAnyStoreLink();
  const Icon = platform === "android" ? Play : platform === "ios" ? Apple : Smartphone;

  if (!live) {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <Button
          size="lg"
          variant="ghost"
          disabled
          className="btn-premium h-12 min-w-64 rounded-xl px-7 sm:h-14"
        >
          <Smartphone className="h-4 w-4" />
          {t("app_get_the_app")}
        </Button>
        <p className="text-xs font-medium text-brand-500">{t("app_stores_coming_soon")}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <a href={href} target="_blank" rel="noreferrer" className="group">
        <Button
          size="lg"
          variant="ghost"
          className="btn-premium h-12 min-w-64 rounded-xl px-7 sm:h-14"
        >
          <Icon className="h-4 w-4" />
          {t("app_get_the_app")}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </a>
      {/* Desktop visitors get to pick; phones already went to the right store. */}
      {platform === "other" && IOS_APP_URL && ANDROID_APP_URL ? (
        <p className="flex items-center gap-3 text-xs font-semibold text-brand-500">
          <a href={IOS_APP_URL} target="_blank" rel="noreferrer" className="hover:text-brand-950">
            {t("app_store_ios")}
          </a>
          <span aria-hidden>·</span>
          <a href={ANDROID_APP_URL} target="_blank" rel="noreferrer" className="hover:text-brand-950">
            {t("app_store_android")}
          </a>
        </p>
      ) : null}
    </div>
  );
}
