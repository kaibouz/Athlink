"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useLocale } from "@/lib/i18n/provider";

function AdminLoginForm() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const errorParam = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "not_executive" ? t("admin_not_executive") : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/auth/register")
      .then((r) => r.json())
      .then((data: { allowed?: boolean }) => setRegisterOpen(Boolean(data.allowed)))
      .catch(() => setRegisterOpen(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(
        data.error === "NOT_EXECUTIVE" ? t("admin_not_executive") : t("login_error"),
      );
      return;
    }

    router.replace(next);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm flex-col justify-center px-4 py-12">
      <div className="admin-auth-card p-8">
        <div className="text-center">
          <Link href="/" className="inline-block text-xl">
            <AthLinkMark athClassName="text-[var(--admin-text)]" linkClassName="text-sky-300" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold">{t("admin_login_title")}</h1>
          <p className="mt-1.5 text-sm text-[var(--admin-text-dim)]">{t("admin_login_sub")}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm text-[var(--admin-text-dim)]">
              {t("login_email")}
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input w-full rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm text-[var(--admin-text-dim)]">
              {t("login_password")}
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input w-full rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <button type="submit" disabled={submitting} className="admin-btn-primary w-full py-2.5">
            {submitting ? t("loading") : t("login_submit")}
          </button>
          {error && <p className="text-center text-sm text-[#ff5f6d]">{error}</p>}
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-[var(--admin-text-dim)]">
          {registerOpen && (
            <p>
              <Link href="/admin/register" className="font-semibold text-sky-300 hover:underline">
                {t("admin_register_title")}
              </Link>
            </p>
          )}
          <Link href="/" className="block hover:text-[var(--admin-text)]">
            {t("admin_back_site")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const { t } = useLocale();

  return (
    <div className="admin-console admin-auth-page">
      <header className="flex h-14 items-center justify-end px-4 sm:px-6">
        <LocaleSwitcher compact />
      </header>
      <Suspense fallback={<div className="p-8 text-center">{t("loading")}</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
