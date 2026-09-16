"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/lib/store";
import { bookingsForCoach } from "@/lib/coach-bookings";
import { useMyCoach } from "@/lib/use-my-coach";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { PageContainer, PageHeader } from "@/components/layout/PageShell";
import { PastRecordsPanel, UpcomingRecordsPanel } from "@/components/social/PastRecordsPanel";
import { QuickMyPageEntry } from "@/components/auth/QuickMyPageEntry";
import { usePlatformPlan } from "@/components/plans/PlanComparison";
import { DemoPlanToggle } from "@/components/plans/DemoPlanToggle";
import { isDemoPlanAccount } from "@/lib/demo-plan";
import { MARKET_TO_PLATFORM, signInHref } from "@/lib/market-to-platform";
import type { CaRegionId } from "@/lib/dashboard-analytics";

const linkClass =
  "flex items-center justify-between rounded-xl border border-brand-50 bg-brand-50/50 px-4 py-3 text-sm font-semibold text-brand-900 transition hover:border-brand-100 hover:bg-brand-50";

function regionFromLocation(locStr: string): CaRegionId {
  const l = locStr.toLowerCase();
  if (l.includes("orange")) return "oc";
  if (l.includes("diego")) return "sd";
  if (l.includes("francisco") || l.includes("bay") || l.includes("jose")) return "bay";
  if (l.includes("sacramento")) return "sac";
  if (l.includes("inland") || l.includes("riverside")) return "ie";
  if (l.includes("fresno") || l.includes("central")) return "cv";
  return "la";
}

export default function MyPage() {
  const router = useRouter();
  const { user, logout, bookings } = useAuth();
  const { t } = useLocale();
  const { coach, hasProfile } = useMyCoach();
  const { isPro, busy, setPlan } = usePlatformPlan();
  const coachBookings = bookingsForCoach(bookings, coach?.id);
  const isDemo = isDemoPlanAccount(user);

  if (!user) {
    return (
      <PageContainer className="py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("me_title")}</h1>
        <p className="mt-2 text-brand-600">{t("me_login_hint")}</p>
        <div className="mx-auto mt-6 max-w-md text-left">
          <QuickMyPageEntry />
        </div>
        <Link href={signInHref("/me")} className="mt-6 inline-block">
          <Button>{t("nav_login")}</Button>
        </Link>
      </PageContainer>
    );
  }

  const isCoach = user.role === "coach";
  const roleLabel = isCoach
    ? t("role_coach")
    : user.role === "parent"
      ? t("role_parent")
      : t("role_athlete");

  return (
    <PageContainer>
      <PageHeader title={t("me_title")} description={t("me_sub")} />

      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 py-6 text-white sm:px-6">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user.avatarUrl ??
                  (isCoach
                    ? coach?.avatarUrl
                    : "https://api.dicebear.com/9.x/avataaars/svg?seed=Athlete") ??
                  "https://api.dicebear.com/9.x/avataaars/svg?seed=Athlete"
                }
                alt=""
                className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white/30 bg-brand-500 object-cover sm:h-20 sm:w-20"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xl font-bold sm:text-2xl">{user.name}</p>
                <p className="truncate text-sm text-white/80">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className="border-white/20 bg-white/15 text-white">{roleLabel}</Badge>
                  <Badge
                    className={
                      isPro
                        ? "border-amber-200/40 bg-amber-400/90 text-brand-950"
                        : "border-white/20 bg-white/15 text-white"
                    }
                  >
                    {isPro ? (
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {t("plan_pro_name")}
                      </span>
                    ) : (
                      t("plan_free_name")
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid divide-y divide-brand-50 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {isCoach ? (
              <>
                <Link href="/coach/register" className={`${linkClass} rounded-none border-0`}>
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-brand-600" />
                    {t("me_edit_coach_profile")}
                  </span>
                  <ChevronRight className="h-4 w-4 text-brand-400" />
                </Link>
                <Link href={hasProfile && coach ? `/coaches/${coach.id}` : "/coach/register"} className={`${linkClass} rounded-none border-0`}>
                  <span>{t("me_view_public")}</span>
                  <ChevronRight className="h-4 w-4 text-brand-400" />
                </Link>
              </>
            ) : (
              <>
                <Link href="/athletes/a1/edit" className={`${linkClass} rounded-none border-0`}>
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-brand-600" />
                    {t("me_edit_athlete_profile")}
                  </span>
                  <ChevronRight className="h-4 w-4 text-brand-400" />
                </Link>
                <Link href="/athletes/a1" className={`${linkClass} rounded-none border-0`}>
                  <span>{t("me_view_public")}</span>
                  <ChevronRight className="h-4 w-4 text-brand-400" />
                </Link>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6" id="account-status">
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-brand-950">{t("plan_account_status_title")}</p>
              <p className="mt-0.5 text-sm text-brand-600">
                {isPro ? t("plan_me_pro_body") : t("plan_me_free_body")}
              </p>
              <p className="mt-2 text-xs text-brand-500">
                {isDemo ? t("plan_demo_toggle_hint") : t("plan_auto_switch_note")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/pricing">
                <Button variant="ghost">{t("plan_compare_link")}</Button>
              </Link>
              {!isPro ? (
                <Button disabled={busy} onClick={() => void setPlan("pro")}>
                  <Sparkles className="h-4 w-4" />
                  {t("plan_upgrade_cta")}
                </Button>
              ) : null}
            </div>
          </div>
          {isDemo ? (
            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3 dark:border-white/10 dark:bg-white/5">
              <p className="mb-2 text-xs font-semibold tracking-wide text-brand-500 uppercase">
                {t("plan_demo_toggle_label")}
              </p>
              <DemoPlanToggle />
            </div>
          ) : null}
        </CardBody>
      </Card>

      {isCoach && coach && (
        <div className="mt-6 space-y-4">
          <UpcomingRecordsPanel
            bookings={coachBookings}
            regionHint={regionFromLocation(coach.location)}
            defaultOpen
          />
          <PastRecordsPanel
            bookings={coachBookings}
            regionHint={regionFromLocation(coach.location)}
          />
        </div>
      )}

      <Button
        variant="ghost"
        className="mt-6 justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => {
          void (async () => {
            await logout();
            router.replace(MARKET_TO_PLATFORM.hq);
          })();
        }}
      >
        <LogOut className="h-4 w-4" />
        {t("nav_logout")}
      </Button>
    </PageContainer>
  );
}
