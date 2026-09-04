"use client";

import Link from "next/link";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";

const GOALS = [
  { label: "Exit velo → 88", value: "84", pct: 84 / 88 },
  { label: "Hip–shoulder sep → 45°", value: "38°", pct: 38 / 45 },
  { label: "Pop time → 2.0s", value: "2.08", pct: 0.72 },
];

/** Progress tab — headline metric, ranked goals, report cards */
export function AthleteProgressScreen() {
  const { user } = useAuth();
  const { t } = useLocale();

  if (!user) {
    return (
      <div className="mx-app mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="mt-2 text-[var(--mx-dim)]">{t("bookings_login_hint")}</p>
        <Link href="/sign-in?redirect_url=/progress" className="mt-6 inline-block">
          <Button className="mx-btn mx-btn-accent border-0">{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-app mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="mx-hdr">
        <div>
          <h1>Progress</h1>
          <small>Last 8 weeks</small>
        </div>
      </header>

      <div className="mx-card mb-3">
        <div className="mx-t">Exit velocity</div>
        <div className="mx-big">
          84 <span className="text-sm font-semibold text-[var(--mx-green)]">▲ 8 since Jul 1</span>
        </div>
        <svg viewBox="0 0 280 64" className="mt-3 h-16 w-full" aria-hidden>
          <polyline
            fill="none"
            stroke="#22c7e0"
            strokeWidth="2.5"
            points="0,48 40,44 80,46 120,38 160,34 200,28 240,22 280,18"
          />
        </svg>
      </div>

      <div className="mx-card mb-3">
        <div className="mx-t">Goals</div>
        {GOALS.map((g, i) => (
          <div key={g.label} className="mx-rank">
            <span className="n">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">{g.label}</span>
            <span className="v">{g.value}</span>
          </div>
        ))}
        {GOALS.map((g) => (
          <div key={`${g.label}-bar`} className="mx-bar mb-2">
            <i style={{ width: `${Math.min(100, g.pct * 100)}%` }} />
          </div>
        ))}
      </div>

      <div className="mx-card">
        <div className="mx-t">Report cards</div>
        <Link href="/messages" className="mx-li mb-2">
          <div className="mx-w">
            <b>Aug 31 · Chris Alvarez</b>
            <span>Hands loading late — fix the trigger</span>
          </div>
          <span className="text-[var(--mx-dimmer)]">›</span>
        </Link>
        <Link href="/messages" className="mx-li">
          <div className="mx-w">
            <b>Aug 24 · Chris Alvarez</b>
            <span>Bat path cleaner on two-strike</span>
          </div>
          <span className="text-[var(--mx-dimmer)]">›</span>
        </Link>
      </div>
    </div>
  );
}
