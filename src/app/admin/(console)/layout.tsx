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
  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    user = await getCurrentUser();
  } catch (err) {
    // Database unreachable: show a clear message instead of crashing the console.
    console.error("[admin] session lookup failed", err);
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
        <h1 className="text-lg font-semibold">Database unavailable</h1>
        <p className="mt-2 text-sm opacity-70">
          The admin console could not reach the database, so it cannot verify your session. Check{" "}
          <code>DATABASE_URL</code> and that the database is running, then reload.
        </p>
        <a href="/admin/login" className="mt-6 text-sm underline">
          Back to sign in
        </a>
      </div>
    );
  }
  if (!user) {
    redirect("/admin/login");
  }
  if (user.role !== "executive") {
    redirect("/admin/login?error=not_executive");
  }

  const overview = await getAdminOverview().catch((err) => {
    console.error("[admin] overview failed", err);
    return null;
  });
  const badges = {
    errors: overview?.alertsOpen ?? 0,
    bookings: overview?.sessions.pending ?? 0,
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
