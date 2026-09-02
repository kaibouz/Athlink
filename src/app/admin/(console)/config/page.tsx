"use client";

import { useCallback, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";

type Flag = {
  key: string;
  enabled: boolean;
  rolloutPercent: number;
  audience: string;
};

export default function AdminConfigPage() {
  const { t } = useLocale();
  const [flags, setFlags] = useState<Flag[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/feature-flags", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { flags: Flag[] };
      setFlags(data.flags);
    }
  }, []);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  async function toggleFlag(key: string, enabled: boolean) {
    await fetch("/api/admin/feature-flags", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, enabled }),
    });
    void load();
  }

  return (
    <div>
      <AdminPageHeader title={t("admin_nav_config")} subtitle="Feature flags and platform config" onRefresh={() => void load()} />

      <div className="admin-panel overflow-hidden rounded-xl">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-panel-elevated)] text-[var(--admin-text-dim)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Flag</th>
              <th className="px-4 py-3 text-left font-medium">Audience</th>
              <th className="px-4 py-3 text-left font-medium">Rollout</th>
              <th className="px-4 py-3 text-left font-medium">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {flags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--admin-text-dim)]">
                  Run db:seed to load default flags
                </td>
              </tr>
            ) : (
              flags.map((flag) => (
                <tr key={flag.key} className="border-t border-[var(--admin-border)]">
                  <td className="px-4 py-3 font-mono text-xs">{flag.key}</td>
                  <td className="px-4 py-3 text-[var(--admin-text-dim)]">{flag.audience}</td>
                  <td className="px-4 py-3">{flag.rolloutPercent}%</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void toggleFlag(flag.key, !flag.enabled)}
                      className={flag.enabled ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}
                    >
                      {flag.enabled ? "On" : "Off"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
