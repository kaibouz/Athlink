"use client";

import { useCallback, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminMemberPanel, StatusBadge } from "@/components/admin/AdminMemberPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";

type Coach = {
  id: string;
  userId: string;
  name: string;
  email: string;
  city: string;
  sport: string;
  verified: boolean;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  status: "active" | "suspended";
};

export default function AdminCoachesPage() {
  const { t } = useLocale();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/coaches", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { coaches: Coach[] };
      setCoaches(data.coaches);
    }
  }, []);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title={t("admin_nav_coaches")}
        subtitle="Registered coaches — live on the market as soon as they sign up"
        onRefresh={() => void load()}
      />

      <AdminDataTable
        rows={coaches}
        emptyMessage="No coaches have registered yet"
        filterFn={(row, q) => [row.name, row.email, row.city, row.sport].join(" ").toLowerCase().includes(q)}
        columns={[
          { key: "name", header: "Name", render: (r) => r.name, csv: (r) => r.name },
          { key: "email", header: "Email", render: (r) => r.email, csv: (r) => r.email },
          { key: "sport", header: "Sport", render: (r) => r.sport, csv: (r) => r.sport },
          { key: "city", header: "Area", render: (r) => r.city, csv: (r) => r.city },
          {
            key: "price",
            header: "Rate",
            render: (r) => `$${r.pricePerHour}/hr`,
            csv: (r) => String(r.pricePerHour),
          },
          {
            key: "registered",
            header: "Registered",
            render: (r) => new Date(r.createdAt).toLocaleDateString(),
            csv: (r) => r.createdAt,
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <StatusBadge status={r.status} />,
            csv: (r) => r.status,
          },
          {
            key: "actions",
            header: "",
            sortable: false,
            render: (r) => (
              <button type="button" className="admin-btn-ghost text-xs" onClick={() => setSelected(r.userId)}>
                Details
              </button>
            ),
          },
        ]}
      />

      {selected ? (
        <AdminMemberPanel userId={selected} onClose={() => setSelected(null)} onChanged={() => void load()} />
      ) : null}
    </div>
  );
}
