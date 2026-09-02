"use client";

import { useCallback, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";

type Booking = {
  id: string;
  coachName: string;
  athleteName: string;
  date: string;
  startTime: string;
  status: string;
  price: number;
};

export default function AdminBookingsPage() {
  const { t } = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/bookings", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { bookings: Booking[] };
      setBookings(data.bookings);
    }
  }, []);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  const pending = bookings.filter((b) => b.status === "pending");

  return (
    <div>
      <AdminPageHeader
        title={t("admin_nav_bookings")}
        subtitle="Sessions and payments — Stripe mismatch table when billing is live"
        onRefresh={() => void load()}
      />

      {pending.length > 0 ? (
        <div className="mb-6 rounded-xl border border-[#f5a623]/40 bg-[#f5a623]/10 px-4 py-3 text-sm text-[#f5a623]">
          {pending.length} session(s) pending confirmation — review below.
        </div>
      ) : null}

      <AdminDataTable
        rows={bookings}
        filterFn={(row, q) =>
          [row.id, row.coachName, row.athleteName, row.status, row.date]
            .join(" ")
            .toLowerCase()
            .includes(q)
        }
        columns={[
          { key: "id", header: "ID", render: (r) => <span className="font-mono text-xs">{r.id}</span>, csv: (r) => r.id },
          { key: "date", header: "Date", render: (r) => `${r.date} ${r.startTime}`, csv: (r) => r.date },
          { key: "coach", header: "Coach", render: (r) => r.coachName, csv: (r) => r.coachName },
          { key: "athlete", header: "Athlete", render: (r) => r.athleteName, csv: (r) => r.athleteName },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span
                className={
                  r.status === "cancelled"
                    ? "text-[#ff5f6d]"
                    : r.status === "completed"
                      ? "text-[#3ddc97]"
                      : "text-[#f5a623]"
                }
              >
                {r.status}
              </span>
            ),
            csv: (r) => r.status,
          },
          {
            key: "price",
            header: "Price",
            render: (r) => `$${r.price}`,
            csv: (r) => String(r.price),
          },
        ]}
      />
    </div>
  );
}
