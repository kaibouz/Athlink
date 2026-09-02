"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLocale } from "@/lib/i18n/provider";

export default function AdminAiPage() {
  const { t } = useLocale();

  return (
    <div>
      <AdminPageHeader
        title={t("admin_nav_ai")}
        subtitle="Biomechanical breakdown pipeline — queue, retries, and cost tracking"
      />
      <div className="admin-panel rounded-xl p-8 text-center text-[var(--admin-text-dim)]">
        <p>AI breakdown jobs table not yet in schema.</p>
        <p className="mt-2 text-sm">
          Add <code className="text-sky-300">ai_breakdown_jobs</code> migration when video upload → Edge
          Function analysis is wired.
        </p>
      </div>
    </div>
  );
}
