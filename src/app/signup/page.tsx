"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function SignupPage() {
  const { signup } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("coach");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await signup(email.trim(), password, name.trim(), role);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error === "EMAIL_TAKEN" ? t("signup_email_taken") : t("signup_error"));
      return;
    }
    router.push(dashboardFor(role));
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
        <h1 className="mt-8 text-2xl font-bold text-brand-950">{t("signup_title")}</h1>
        <p className="mt-1.5 text-sm text-brand-500">{t("signup_sub")}</p>
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
          <Label htmlFor="name">{t("login_name")}</Label>
          <Input
            id="name"
            placeholder={t("signup_name_ph")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">{t("login_email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("signup_email_ph")}
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
            placeholder={t("login_password_ph")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? t("loading") : t("signup_submit")}
        </Button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>

      <p className="mt-8 text-center text-sm text-brand-500">
        {t("signup_have_account")}{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          {t("nav_login")}
        </Link>
      </p>
    </div>
  );
}
