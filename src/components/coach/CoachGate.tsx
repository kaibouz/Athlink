"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";

export function CoachGate({ children }: { children: React.ReactNode }) {
  const { user, switchRole, login } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  if (user?.role === "coach") return <>{children}</>;

  function enterAsCoach() {
    if (user) switchRole("coach");
    else login("coach@athlink.app", "Demo Coach", "coach");
    router.push(pathname.startsWith("/coach") ? pathname : "/coach/dashboard");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-brand-950">{t("coach_gate_title")}</h1>
      <p className="mt-2 text-brand-600">{t("coach_gate_body")}</p>
      <Button className="mt-6 w-full max-w-xs" size="lg" onClick={enterAsCoach}>
        {t("login_switch_to_coach")}
      </Button>
      <Link href="/login?role=coach&next=/coach/dashboard" className="mt-3 inline-block">
        <Button variant="outline">{t("coach_gate_login")}</Button>
      </Link>
    </div>
  );
}
