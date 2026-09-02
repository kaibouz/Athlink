"use client";

import { useCallback, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Mail, MessageSquare } from "lucide-react";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";

export default function AdminMessagingPage() {
  const { t } = useLocale();
  const [stats, setStats] = useState({ threads: 0, unread: 0 });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/messaging", { credentials: "include" });
    if (res.ok) {
      setStats((await res.json()) as { threads: number; unread: number });
    }
  }, []);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title={t("admin_nav_messaging")}
        subtitle="Resend delivery log and coach↔athlete thread health — message bodies hidden unless reported"
        onRefresh={() => void load()}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard label="Message threads" value={stats.threads} icon={MessageSquare} />
        <AdminStatCard label="Unread total" value={stats.unread} icon={Mail} accent="clay" />
      </div>

      <p className="admin-panel mt-6 rounded-xl p-6 text-sm text-[var(--admin-text-dim)]">
        Resend template delivery log and 24h no-reply nudges will appear here once{" "}
        <code className="text-sky-300">RESEND_API_KEY</code> is configured.
      </p>
    </div>
  );
}
