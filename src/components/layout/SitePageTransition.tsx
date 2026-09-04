"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const ENTRY_KEY = "athlink_site_entry_v1";
const INTRO_KEY = "athlink_intro_seen_v2";
const HOLD_MS = 520;
const EXIT_MS = 900;

type EntryPhase = "hold" | "exit" | "done";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function alreadyEntered() {
  try {
    return (
      sessionStorage.getItem(ENTRY_KEY) === "1" ||
      sessionStorage.getItem(INTRO_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function markEntered() {
  try {
    sessionStorage.setItem(ENTRY_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Site jump-in curtain (non-HQ routes) + soft route fade when navigating.
 * HQ (`/`) keeps the cinematic LandingSplash — this avoids a double intro.
 */
export function SitePageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const [entry, setEntry] = useState<EntryPhase>(() =>
    pathname === "/" ? "done" : "hold",
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const routeReady = useRef(false);

  useEffect(() => {
    if (pathname === "/") {
      setEntry("done");
      return;
    }
    if (prefersReducedMotion() || alreadyEntered()) {
      setEntry("done");
      return;
    }

    setEntry("hold");
    const exitTimer = window.setTimeout(() => setEntry("exit"), HOLD_MS);
    const doneTimer = window.setTimeout(() => {
      markEntered();
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
    el.classList.remove("site-route-enter");
    // Force reflow so the enter animation retriggers on every navigation.
    void el.offsetWidth;
    el.classList.add("site-route-enter");
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
