"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";
import type { HealthCheck } from "@/lib/admin/health";

type Overview = {
  signups: { coach: number; athlete: number; total: number; delta7d: number };
  sessions: { booked: number; completed: number; cancelled: number; pending: number };
  users: { total: number; coaches: number; athletes: number; executives: number };
  alertsOpen: number;
  applicationsPending: number;
};

export default function AdminDashboardPage() {
  const { t } = useLocale();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [health, setHealth] = useState<HealthCheck[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [ovRes, healthRes] = await Promise.all([
        fetch("/api/admin/overview", { credentials: "include" }),
        fetch("/api/admin/health", { credentials: "include" }),
      ]);
      if (ovRes.ok) setOverview((await ovRes.json()) as Overview);
      if (healthRes.ok) {
        const data = (await healthRes.json()) as { checks: HealthCheck[] };
        setHealth(data.checks);
      }
      setLastRefresh(new Date());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useDeferredEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (!overview) {
    return <div className="py-16 text-center text-[var(--admin-text-dim)]">{t("loading")}</div>;
  }

  const downChecks = health.filter((c) => c.status === "down").length;

  return (
    <div>
      <AdminPageHeader
        title={t("admin_dashboard")}
        subtitle={t("admin_login_sub")}
        lastRefresh={lastRefresh}
        onRefresh={() => void load()}
        refreshing={refreshing}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={t("admin_stats_signups")}
          value={overview.signups.delta7d}
          sub={`Coach ${overview.signups.coach} · Athlete ${overview.signups.athlete}`}
          icon={TrendingUp}
        />
        <AdminStatCard
          label={t("admin_stats_bookings")}
          value={overview.sessions.booked}
          sub={`Done ${overview.sessions.completed} · Cancel ${overview.sessions.cancelled}`}
          icon={CalendarCheck}
          accent="clay"
        />
        <AdminStatCard
          label={t("admin_stats_coaches")}
          value={overview.users.coaches}
          sub={`${overview.users.athletes} athletes · ${overview.users.executives} exec`}
          icon={UserRound}
        />
        <AdminStatCard
          label={t("admin_nav_errors")}
          value={downChecks + overview.alertsOpen}
          sub={downChecks ? `${downChecks} dependency down` : "System health"}
          icon={AlertTriangle}
          accent={downChecks ? "red" : "green"}
        />
      </div>

      {overview.applicationsPending > 0 || overview.alertsOpen > 0 ? (
        <section className="admin-panel mt-6 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--admin-text)]">{t("admin_needs_attention")}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {overview.applicationsPending > 0 ? (
              <li className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-[var(--admin-text-dim)]">
                  {overview.applicationsPending} coach application(s) pending
                </span>
                <Link href="/admin/coaches" className="admin-btn-primary text-xs">
                  Review
                </Link>
              </li>
            ) : null}
            {overview.sessions.pending > 0 ? (
              <li className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-[var(--admin-text-dim)]">
                  {overview.sessions.pending} booking(s) awaiting confirmation
                </span>
                <Link href="/admin/bookings" className="admin-btn-primary text-xs">
                  Open
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <section className="admin-panel mt-6 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--admin-text)]">System health</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {health.map((check) => (
            <li
              key={check.id}
              className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm"
            >
              <span className="text-[var(--admin-text-dim)]">{check.label}</span>
              <span className={`admin-status-${check.status} font-medium capitalize`}>
                {check.status}
                {check.latencyMs != null ? ` · ${check.latencyMs}ms` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/coaches" className="admin-panel rounded-xl p-4 hover:bg-white/[0.02]">
          <Users className="h-5 w-5 text-sky-400" />
          <p className="mt-2 font-semibold">{t("admin_nav_coaches")}</p>
        </Link>
        <Link href="/admin/bookings" className="admin-panel rounded-xl p-4 hover:bg-white/[0.02]">
          <CalendarCheck className="h-5 w-5 text-amber-300" />
          <p className="mt-2 font-semibold">{t("admin_nav_bookings")}</p>
        </Link>
        <Link href="/admin/users" className="admin-panel rounded-xl p-4 hover:bg-white/[0.02]">
          <Users className="h-5 w-5 text-emerald-400" />
          <p className="mt-2 font-semibold">{t("admin_users")}</p>
        </Link>
      </section>
    </div>
  );
}
