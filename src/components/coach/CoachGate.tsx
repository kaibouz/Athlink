"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";

export function CoachGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t } = useLocale();
  const pathname = usePathname();

  if (user?.role === "coach") return <>{children}</>;

  const next = encodeURIComponent(pathname.startsWith("/coach") ? pathname : "/coach/dashboard");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-brand-950">{t("coach_gate_title")}</h1>
      <p className="mt-2 text-brand-600">{t("coach_gate_body")}</p>
      <Link href={`/signup?role=coach&next=${next}`} className="mt-6 inline-block w-full max-w-xs">
        <Button className="w-full" size="lg">
          {t("signup_title")}
        </Button>
      </Link>
      <Link href={`/login?role=coach&next=${next}`} className="mt-3 inline-block">
        <Button variant="outline">{t("coach_gate_login")}</Button>
      </Link>
    </div>
  );
}
