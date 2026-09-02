"use client";

import { useCallback, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";

type Coach = {
  id: string;
  name: string;
  email: string;
  city: string;
  verified: boolean;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
};

type Application = {
  id: string;
  name: string;
  email: string;
  area: string;
  specialty: string;
  status: string;
  submittedAt: string;
};

export default function AdminCoachesPage() {
  const { t } = useLocale();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/coaches", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { coaches: Coach[]; applications: Application[] };
      setCoaches(data.coaches);
      setApplications(
        data.applications.map((a) => ({
          ...a,
          submittedAt: new Date(a.submittedAt).toLocaleDateString(),
        })),
      );
    }
  }, []);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  async function reviewApplication(id: string, action: "approve" | "reject" | "request_info") {
    if (action === "reject" && !window.confirm("Reject this application?")) return;
    await fetch("/api/admin/applications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    void load();
  }

  return (
    <div>
      <AdminPageHeader title={t("admin_nav_coaches")} subtitle="Verification queue and active coaches" onRefresh={() => void load()} />

      <h2 className="mb-3 text-sm font-semibold text-[var(--admin-text)]">Application queue</h2>
      <AdminDataTable
        rows={applications}
        emptyMessage="No pending applications"
        filterFn={(row, q) =>
          [row.name, row.email, row.area, row.specialty, row.status].join(" ").toLowerCase().includes(q)
        }
        columns={[
          { key: "name", header: "Name", render: (r) => r.name, csv: (r) => r.name },
          { key: "area", header: "Area", render: (r) => r.area, csv: (r) => r.area },
          { key: "specialty", header: "Specialty", render: (r) => r.specialty, csv: (r) => r.specialty },
          { key: "status", header: "Status", render: (r) => r.status, csv: (r) => r.status },
          {
            key: "actions",
            header: "Actions",
            sortable: false,
            render: (r) =>
              r.status === "pending" ? (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="admin-btn-primary text-xs" onClick={() => void reviewApplication(r.id, "approve")}>
                    Approve
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs" onClick={() => void reviewApplication(r.id, "request_info")}>
                    Request info
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs text-[#ff5f6d]" onClick={() => void reviewApplication(r.id, "reject")}>
                    Reject
                  </button>
                </div>
              ) : (
                "—"
              ),
          },
        ]}
      />

      <h2 className="mb-3 mt-8 text-sm font-semibold text-[var(--admin-text)]">Active coaches</h2>
      <AdminDataTable
        rows={coaches}
        filterFn={(row, q) =>
          [row.name, row.email, row.city].join(" ").toLowerCase().includes(q)
        }
        columns={[
          { key: "name", header: "Name", render: (r) => r.name, csv: (r) => r.name },
          { key: "city", header: "Area", render: (r) => r.city, csv: (r) => r.city },
          {
            key: "verified",
            header: "Verified",
            render: (r) => (r.verified ? "Yes" : "No"),
            csv: (r) => (r.verified ? "yes" : "no"),
          },
          {
            key: "price",
            header: "Rate",
            render: (r) => `$${r.pricePerHour}/hr`,
            csv: (r) => String(r.pricePerHour),
          },
          {
            key: "rating",
            header: "Rating",
            render: (r) => `${r.rating} (${r.reviewCount})`,
            csv: (r) => String(r.rating),
          },
        ]}
      />
    </div>
  );
}
