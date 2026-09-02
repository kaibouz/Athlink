import { redirect } from "next/navigation";
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
    coaches: overview.applicationsPending,
    errors: overview.alertsOpen,
    bookings: overview.sessions.pending,
  };

  return (
    <AdminShell user={user} badges={badges}>
      {children}
    </AdminShell>
  );
}
