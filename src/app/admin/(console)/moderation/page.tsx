"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLocale } from "@/lib/i18n/provider";

export default function AdminModerationPage() {
  const { t } = useLocale();

  return (
    <div>
      <AdminPageHeader title={t("admin_nav_moderation")} subtitle="Reported feed posts and message threads" />
      <div className="admin-panel rounded-xl p-8 text-center text-[var(--admin-text-dim)]">
        <p>No moderation reports in database yet.</p>
        <p className="mt-2 text-sm">Add reported_posts / reported_threads tables when user reporting ships.</p>
      </div>
    </div>
  );
}
