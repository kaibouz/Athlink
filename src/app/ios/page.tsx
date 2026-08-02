"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/provider";

const SCREENS = [
  { id: "home", path: "/", labelKey: "ios_screen_home" as const },
  { id: "login", path: "/login", labelKey: "ios_screen_login" as const },
  { id: "dash", path: "/coach/dashboard", labelKey: "ios_screen_dash" as const },
  { id: "cal", path: "/coach/calendar", labelKey: "ios_screen_cal" as const },
  { id: "feed", path: "/sns", labelKey: "ios_screen_feed" as const },
];

/** Desktop preview: AthLink inside an iPhone frame (iOS-style mobile UI) */
export default function IosPreviewPage() {
  const { t } = useLocale();
  const [screen, setScreen] = useState(SCREENS[1].path);
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: false }),
      );
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
              {t("ios_preview_badge")}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{t("ios_preview_title")}</h1>
            <p className="mt-1 text-sm text-zinc-400">{t("ios_preview_sub")}</p>
          </div>
          <Link
            href="/"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            {t("ios_exit")}
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {SCREENS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScreen(s.path)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                screen === s.path
                  ? "bg-brand-500 text-white"
                  : "bg-white/10 text-zinc-300 hover:bg-white/15"
              }`}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          {/* iPhone 15 Pro-ish frame */}
          <div className="relative w-[390px] max-w-full rounded-[3rem] bg-zinc-900 p-[12px] shadow-[0_0_0_2px_#3f3f46,0_25px_80px_rgba(0,0,0,0.55)]">
            <div className="relative overflow-hidden rounded-[2.4rem] bg-black">
              {/* Status bar */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-11 items-end justify-between px-7 pb-1 text-[13px] font-semibold text-white">
                <span className="w-16">{time}</span>
                <div className="absolute left-1/2 top-2.5 h-[28px] w-[110px] -translate-x-1/2 rounded-full bg-black" />
                <div className="flex w-20 items-center justify-end gap-1.5">
                  <span className="text-[11px]">■■■</span>
                  <span className="inline-block h-2.5 w-6 rounded-[3px] border border-white/90">
                    <span className="m-[1px] block h-full w-[70%] rounded-[1px] bg-white" />
                  </span>
                </div>
              </div>

              <iframe
                key={screen}
                title="AthLink iOS"
                src={screen}
                className="h-[780px] w-full border-0 bg-white"
                style={{ paddingTop: 0 }}
              />

              {/* Home indicator */}
              <div className="pointer-events-none absolute inset-x-0 bottom-1 z-20 flex justify-center">
                <div className="h-[5px] w-[130px] rounded-full bg-white/80" />
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-xs text-zinc-500">
          {t("ios_preview_hint")}
        </p>
      </div>
    </div>
  );
}
