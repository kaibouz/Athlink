"use client";

import { useCallback, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";

type AuditEntry = {
  id: string;
  adminName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
};

export default function AdminAuditPage() {
  const { t } = useLocale();
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/audit", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as {
        entries: (AuditEntry & { createdAt: string })[];
      };
      setEntries(
        data.entries.map((e) => ({
          ...e,
          createdAt: new Date(e.createdAt).toLocaleString(),
        })),
      );
    }
  }, []);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader title={t("admin_nav_audit")} subtitle="Every executive write action" onRefresh={() => void load()} />

      <AdminDataTable
        rows={entries}
        filterFn={(row, q) =>
          [row.action, row.adminName ?? "", row.targetType ?? "", row.targetId ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(q)
        }
        columns={[
          {
            key: "time",
            header: "When",
            render: (r) => r.createdAt,
            csv: (r) => r.createdAt,
          },
          {
            key: "admin",
            header: "Admin",
            render: (r) => r.adminName ?? "—",
            csv: (r) => r.adminName ?? "",
          },
          { key: "action", header: "Action", render: (r) => r.action, csv: (r) => r.action },
          {
            key: "target",
            header: "Target",
            render: (r) => `${r.targetType ?? ""}${r.targetId ? ` · ${r.targetId}` : ""}`,
            csv: (r) => `${r.targetType}:${r.targetId}`,
          },
        ]}
      />
    </div>
  );
}
