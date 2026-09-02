"use client";

import { useCallback, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";
import type { HealthCheck } from "@/lib/admin/health";

export default function AdminErrorsPage() {
  const { t } = useLocale();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/health", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { checks: HealthCheck[] };
      setChecks(data.checks);
      setLastRefresh(new Date());
    }
  }, []);

  useDeferredEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title={t("admin_nav_errors")}
        subtitle="Web errors, webhooks, and email delivery — Sentry/Stripe/Resend integrations planned"
        lastRefresh={lastRefresh}
        onRefresh={() => void load()}
      />

      <AdminDataTable
        rows={checks.map((c) => ({ ...c, id: c.id }))}
        filterFn={(row, q) =>
          row.label.toLowerCase().includes(q) || row.status.includes(q) || (row.detail ?? "").toLowerCase().includes(q)
        }
        columns={[
          { key: "label", header: "Service", render: (r) => r.label, csv: (r) => r.label },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span className={`admin-status-${r.status} capitalize`}>{r.status}</span>
            ),
            csv: (r) => r.status,
          },
          {
            key: "latency",
            header: "Latency",
            render: (r) => (r.latencyMs != null ? `${r.latencyMs}ms` : "—"),
            csv: (r) => String(r.latencyMs ?? ""),
          },
          {
            key: "detail",
            header: "Detail",
            render: (r) => <span className="text-[var(--admin-text-dim)]">{r.detail ?? "—"}</span>,
            csv: (r) => r.detail ?? "",
          },
        ]}
      />

      <p className="mt-6 text-sm text-[var(--admin-text-dim)]">
        Stripe webhook retries, Resend bounce log, and Sentry issue grouping will live here once those
        services are connected.
      </p>
    </div>
  );
}
