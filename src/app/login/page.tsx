"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store";
import type { UserRole } from "@/types";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { AthLinkMark } from "@/components/brand/AthLinkMark";
import { cn } from "@/lib/utils";

function dashboardFor(role: UserRole) {
  return role === "coach" ? "/coach/dashboard" : "/bookings";
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0]?.trim() || "Athlete";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function LoginForm() {
  const { login, user, hydrated } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const roleParam = params.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<UserRole>(
    roleParam === "athlete" || roleParam === "parent" ? roleParam : "coach",
  );

  useEffect(() => {
    if (!hydrated || !user) return;
    router.replace(next || dashboardFor(user.role));
  }, [user, hydrated, next, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password) return;
    setSubmitting(true);
    setError(null);
    const result = await login(trimmed, password, role);
    setSubmitting(false);
    if (!result.ok) {
      setError(t("login_error"));
      return;
    }
    router.push(next || dashboardFor(role));
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm flex-col justify-center px-4 py-12 md:min-h-screen">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">
            A
          </span>
          <span className="text-xl">
              <AthLinkMark />
            </span>
        </Link>
        <h1 className="mt-8 text-2xl font-bold text-brand-950">{t("login_title")}</h1>
        <p className="mt-1.5 text-sm text-brand-500">{t("login_simple_sub")}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-brand-100 bg-brand-50/50 p-1">
          {(["coach", "athlete"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                role === r
                  ? "bg-surface text-brand-900 shadow-sm"
                  : "text-brand-500 hover:text-brand-800",
              )}
            >
              {r === "coach" ? t("role_coach") : t("role_athlete")}
            </button>
          ))}
        </div>

        <div>
          <Label htmlFor="email">{t("login_email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("login_email_ph")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">{t("login_password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder={t("login_password_ph")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? t("loading") : t("login_submit")}
        </Button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>

      <p className="mt-8 text-center text-sm text-brand-500">
        {t("login_no_account")}{" "}
        <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
          {t("login_signup_link")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useLocale();
  return (
    <Suspense fallback={<div className="p-8 text-center">{t("loading")}</div>}>
      <LoginForm />
    </Suspense>
  );
}
