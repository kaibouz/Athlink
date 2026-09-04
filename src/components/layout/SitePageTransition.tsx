"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/provider";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro-session";
import { routeEnterClass, showsEntryCurtain } from "@/lib/route-layer";
import { cn } from "@/lib/utils";

const HOLD_MS = 520;
const EXIT_MS = 900;

type EntryPhase = "hold" | "exit" | "done";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Site jump-in curtain (consumer routes) + route fade when navigating.
 * HQ (`/`) keeps the cinematic LandingSplash and the admin console / operator
 * tools get no consumer branding at all.
 */
export function SitePageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const [entry, setEntry] = useState<EntryPhase>(() =>
    showsEntryCurtain(pathname) ? "hold" : "done",
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const routeReady = useRef(false);

  useEffect(() => {
    if (!showsEntryCurtain(pathname)) {
      setEntry("done");
      return;
    }
    if (prefersReducedMotion() || hasSeenIntro()) {
      setEntry("done");
      return;
    }

    setEntry("hold");
    const exitTimer = window.setTimeout(() => setEntry("exit"), HOLD_MS);
    const doneTimer = window.setTimeout(() => {
      markIntroSeen();
      setEntry("done");
    }, HOLD_MS + EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- first paint entry only
  }, []);

  useEffect(() => {
    if (!routeReady.current) {
      routeReady.current = true;
      return;
    }
    if (prefersReducedMotion()) return;
    const el = contentRef.current;
    if (!el) return;
    el.classList.remove("site-route-enter", "site-route-enter-app");
    // Force reflow so the enter animation retriggers on every navigation.
    void el.offsetWidth;
    el.classList.add(routeEnterClass(pathname));
  }, [pathname]);

  return (
    <>
      {entry !== "done" ? (
        <div
          className={cn(
            "site-entry-curtain",
            entry === "exit" && "site-entry-curtain-exit",
          )}
          role="dialog"
          aria-modal="true"
          aria-label={t("splash_aria")}
        >
          <div className="site-entry-glow" aria-hidden />
          <div className="site-entry-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/athlinkpro-logo-transparent.png"
              alt=""
              width={1154}
              height={895}
              className="site-entry-logo"
            />
            <p className="site-entry-tag">{t("hero_tagline")}</p>
          </div>
        </div>
      ) : null}

      <div ref={contentRef} className="site-route-page">
        {children}
      </div>
    </>
  );
}
