"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useLocale } from "@/lib/i18n/provider";

function AdminRegisterForm() {
  const { t } = useLocale();
  const router = useRouter();

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapSecret, setBootstrapSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/auth/register")
      .then((r) => r.json())
      .then((data: { allowed?: boolean; reason?: string }) => {
        setAllowed(Boolean(data.allowed));
        setNeedsBootstrap(data.reason === "bootstrap");
      })
      .catch(() => setAllowed(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
        bootstrapSecret: bootstrapSecret || undefined,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      if (data.error === "EMAIL_DOMAIN_FORBIDDEN") {
        setError(t("admin_email_domain_hint"));
      } else if (data.error === "EMAIL_TAKEN") {
        setError(t("signup_email_taken"));
      } else if (data.error === "BOOTSTRAP_REQUIRED") {
        setError(t("admin_bootstrap_ph"));
      } else {
        setError(t("signup_error"));
      }
      return;
    }

    router.replace("/admin");
  }

  if (allowed === null) {
    return (
      <div className="p-8 text-center text-[var(--admin-text-dim)]">{t("loading")}</div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <div className="admin-auth-card p-8">
          <p className="text-[var(--admin-text-dim)]">{t("admin_not_executive")}</p>
          <Link
            href="/admin/login"
            className="mt-6 inline-block font-semibold text-sky-300 hover:underline"
          >
            {t("admin_login_title")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm flex-col justify-center px-4 py-12">
      <div className="admin-auth-card p-8">
        <div className="text-center">
          <Link href="/admin/login" className="inline-block text-xl">
            <AthLinkMark athClassName="text-[var(--admin-text)]" linkClassName="text-sky-300" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold">{t("admin_register_title")}</h1>
          <p className="mt-1.5 text-sm text-[var(--admin-text-dim)]">{t("admin_register_sub")}</p>
          <p className="mt-2 text-xs text-[var(--admin-text-dim)]">{t("admin_email_domain_hint")}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="exec-name" className="mb-1.5 block text-sm text-[var(--admin-text-dim)]">
              {t("login_name")}
            </label>
            <input
              id="exec-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="admin-input w-full rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="exec-email" className="mb-1.5 block text-sm text-[var(--admin-text-dim)]">
              {t("login_email")}
            </label>
            <input
              id="exec-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input w-full rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="exec-password" className="mb-1.5 block text-sm text-[var(--admin-text-dim)]">
              {t("login_password")}
            </label>
            <input
              id="exec-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="admin-input w-full rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          {needsBootstrap && (
            <div>
              <label htmlFor="bootstrap" className="mb-1.5 block text-sm text-[var(--admin-text-dim)]">
                {t("admin_bootstrap_label")}
              </label>
              <input
                id="bootstrap"
                type="password"
                autoComplete="off"
                placeholder={t("admin_bootstrap_ph")}
                value={bootstrapSecret}
                onChange={(e) => setBootstrapSecret(e.target.value)}
                required
                className="admin-input w-full rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
          )}
          <button type="submit" disabled={submitting} className="admin-btn-primary w-full py-2.5">
            {submitting ? t("loading") : t("admin_create_executive")}
          </button>
          {error && <p className="text-center text-sm text-[#ff5f6d]">{error}</p>}
        </form>

        <div className="mt-6 text-center text-sm text-[var(--admin-text-dim)]">
          <Link href="/admin/login" className="font-semibold text-sky-300 hover:underline">
            {t("admin_login_title")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminRegisterPage() {
  const { t } = useLocale();

  return (
    <div className="admin-console admin-auth-page">
      <header className="flex h-14 items-center justify-end px-4 sm:px-6">
        <LocaleSwitcher compact />
      </header>
      <Suspense fallback={<div className="p-8 text-center">{t("loading")}</div>}>
        <AdminRegisterForm />
      </Suspense>
    </div>
  );
}
