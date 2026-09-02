"use client";

import { useCallback, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";

type Athlete = {
  id: string;
  name: string;
  email: string;
  position: string;
  location: string;
  classYear: string;
  lookingForCoach: boolean;
};

export default function AdminAthletesPage() {
  const { t } = useLocale();
  const [athletes, setAthletes] = useState<Athlete[]>([]);

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
      <AdminPageHeader title={t("admin_nav_athletes")} subtitle="Athlete roster and engagement" onRefresh={() => void load()} />

      <AdminDataTable
        rows={athletes}
        filterFn={(row, q) =>
          [row.name, row.email, row.position, row.location].join(" ").toLowerCase().includes(q)
        }
        columns={[
          { key: "name", header: "Name", render: (r) => r.name, csv: (r) => r.name },
          { key: "position", header: "Position", render: (r) => r.position, csv: (r) => r.position },
          { key: "location", header: "City", render: (r) => r.location, csv: (r) => r.location },
          { key: "class", header: "Class", render: (r) => r.classYear, csv: (r) => r.classYear },
          {
            key: "looking",
            header: "Seeking coach",
            render: (r) => (r.lookingForCoach ? "Yes" : "No"),
            csv: (r) => (r.lookingForCoach ? "yes" : "no"),
          },
        ]}
      />
    </div>
  );
}
