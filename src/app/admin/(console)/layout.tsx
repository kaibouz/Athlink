import { redirect } from "next/navigation";
import { isDatabaseConfigured } from "@/db";
import { getCurrentUser } from "@/lib/auth-server";
import { getAdminOverview } from "@/lib/admin/data";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  if (user.role !== "executive") {
    redirect("/admin/login?error=not_executive");
  }

  const overview = await getAdminOverview();
  const badges = {
    errors: overview.alertsOpen,
    bookings: overview.sessions.pending,
  };

  return (
    <AdminShell user={user} badges={badges}>
      {!isDatabaseConfigured() ? (
        <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <strong>Database not connected.</strong> Registrations are not being saved and every list below is empty.
          Set <code>DATABASE_URL</code> (Supabase / Neon) and run <code>npm run db:push</code>.
        </div>
      ) : null}
      {children}
    </AdminShell>
  );
}
