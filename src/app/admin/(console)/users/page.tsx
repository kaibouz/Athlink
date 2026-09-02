"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";
import type { UserRole } from "@/types";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { t } = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { users: AdminUser[] };
      setUsers(data.users);
    }
    setLoading(false);
  }

  useDeferredEffect(() => {
    void loadUsers();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      if (data.error === "EMAIL_DOMAIN_FORBIDDEN") {
        setError(t("admin_email_domain_hint"));
      } else {
        setError(t("signup_error"));
      }
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setSuccess(true);
    await loadUsers();
  }

  return (
    <div>
      <AdminPageHeader title={t("admin_users")} subtitle={t("admin_invite_executive")} onRefresh={() => void loadUsers()} />

      <section className="admin-panel rounded-xl p-6">
        <p className="text-sm text-[var(--admin-text-dim)]">{t("admin_email_domain_hint")}</p>
        <form onSubmit={handleInvite} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[var(--admin-text-dim)]">{t("login_name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="admin-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--admin-text-dim)]">{t("login_email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-[var(--admin-text-dim)]">{t("login_password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="admin-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="admin-btn-primary">
              {t("admin_create_executive")}
            </button>
            {error && <p className="mt-2 text-sm text-[#ff5f6d]">{error}</p>}
            {success && <p className="mt-2 text-sm text-[#3ddc97]">{t("admin_create_executive")} ✓</p>}
          </div>
        </form>
      </section>

      <section className="admin-panel mt-8 overflow-hidden rounded-xl">
        {loading ? (
          <p className="p-6 text-[var(--admin-text-dim)]">{t("loading")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-panel-elevated)] text-[var(--admin-text-dim)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[var(--admin-border)]">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3 text-[var(--admin-text-dim)]">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
