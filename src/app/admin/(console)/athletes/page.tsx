"use client";

import { useCallback, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminMemberPanel, StatusBadge } from "@/components/admin/AdminMemberPanel";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";

type Athlete = {
  id: string;
  userId: string;
  name: string;
  email: string;
  position: string;
  location: string;
  classYear: string;
  school: string;
  lookingForCoach: boolean;
  createdAt: string;
  status: "active" | "suspended";
};

export default function AdminAthletesPage() {
  const { t } = useLocale();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/athletes", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { athletes: Athlete[] };
      setAthletes(data.athletes);
    }
  }, []);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader title={t("admin_nav_athletes")} subtitle="Registered athletes" onRefresh={() => void load()} />

      <AdminDataTable
        rows={athletes}
        emptyMessage="No athletes have completed onboarding yet"
        filterFn={(row, q) =>
          [row.name, row.email, row.position, row.location, row.school].join(" ").toLowerCase().includes(q)
        }
        columns={[
          { key: "name", header: "Name", render: (r) => r.name, csv: (r) => r.name },
          { key: "email", header: "Email", render: (r) => r.email, csv: (r) => r.email },
          { key: "school", header: "School", render: (r) => r.school, csv: (r) => r.school },
          { key: "position", header: "Position", render: (r) => r.position, csv: (r) => r.position },
          { key: "location", header: "City", render: (r) => r.location, csv: (r) => r.location },
          { key: "class", header: "Class", render: (r) => r.classYear, csv: (r) => r.classYear },
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
