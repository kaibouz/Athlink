"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  LogOut,
  Moon,
  QrCode,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { getDemoCoach } from "@/lib/coach-bookings";
import { useLocale } from "@/lib/i18n/provider";
import { useTheme } from "@/lib/theme";
import { UI_LOCALES, UI_LOCALE_LABELS, type UiLocale } from "@/lib/i18n/messages";
import { CalendarAutoPrefSelect } from "@/components/calendar/AddToCalendar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function MyPage() {
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const coach = getDemoCoach();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">{t("me_title")}</h1>
        <p className="mt-2 text-brand-600">{t("me_login_hint")}</p>
        <Link href="/login?next=/me" className="mt-6 inline-block">
          <Button>{t("nav_login")}</Button>
        </Link>
      </div>
    );
  }

  const isCoach = user.role === "coach";
  const roleLabel = isCoach
    ? t("role_coach")
    : user.role === "parent"
      ? t("role_parent")
      : t("role_athlete");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-950">{t("me_title")}</h1>
      <p className="mt-1 text-brand-600">{t("me_sub")}</p>

      <section className="mt-6 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              user.avatarUrl ??
              (isCoach
                ? coach.avatarUrl
                : "https://api.dicebear.com/9.x/avataaars/svg?seed=Athlete")
            }
            alt=""
            className="h-16 w-16 rounded-2xl bg-brand-50"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-brand-950">{user.name}</p>
            <p className="truncate text-sm text-brand-500">{user.email}</p>
            <Badge className="mt-2">{roleLabel}</Badge>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {isCoach ? (
            <>
              <Link
                href="/coach/register"
                className="flex items-center justify-between rounded-xl border border-brand-50 bg-brand-50/50 px-4 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
              >
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-brand-600" />
                  {t("me_edit_coach_profile")}
                </span>
                <ChevronRight className="h-4 w-4 text-brand-400" />
              </Link>
              <Link
                href={`/coaches/${coach.id}`}
                className="flex items-center justify-between rounded-xl border border-brand-50 bg-brand-50/50 px-4 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
              >
                <span>{t("me_view_public")}</span>
                <ChevronRight className="h-4 w-4 text-brand-400" />
              </Link>
              <Link
                href="/coach/qr"
                className="flex items-center justify-between rounded-xl border border-brand-50 bg-brand-50/50 px-4 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
              >
                <span className="inline-flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-brand-600" />
                  {t("coach_nav_qr")}
                </span>
                <ChevronRight className="h-4 w-4 text-brand-400" />
              </Link>
              <Link
                href="/coach/calendar"
                className="flex items-center justify-between rounded-xl border border-brand-50 bg-brand-50/50 px-4 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand-600" />
                  {t("coach_nav_calendar")}
                </span>
                <ChevronRight className="h-4 w-4 text-brand-400" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/athletes/a1/edit"
                className="flex items-center justify-between rounded-xl border border-brand-50 bg-brand-50/50 px-4 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
              >
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-brand-600" />
                  {t("me_edit_athlete_profile")}
                </span>
                <ChevronRight className="h-4 w-4 text-brand-400" />
              </Link>
              <Link
                href="/athletes/a1"
                className="flex items-center justify-between rounded-xl border border-brand-50 bg-brand-50/50 px-4 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
              >
                <span>{t("me_view_public")}</span>
                <ChevronRight className="h-4 w-4 text-brand-400" />
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand-600" />
          <h2 className="font-bold text-brand-950">{t("me_settings")}</h2>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-800">
              {t("site_language")}
            </span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as UiLocale)}
              className="h-11 w-full rounded-xl border border-brand-200 bg-surface px-3.5 text-sm text-brand-950 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              {UI_LOCALES.map((code) => (
                <option key={code} value={code}>
                  {UI_LOCALE_LABELS[code]}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-brand-800">
              {t("me_theme")}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  theme === "light"
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-brand-200 text-brand-600 hover:bg-brand-50"
                }`}
              >
                <Sun className="h-4 w-4" />
                {t("me_theme_light")}
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  theme === "dark"
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-brand-200 text-brand-600 hover:bg-brand-50"
                }`}
              >
                <Moon className="h-4 w-4" />
                {t("me_theme_dark")}
              </button>
            </div>
          </div>

          <CalendarAutoPrefSelect />

          <div>
            <span className="mb-1.5 block text-sm font-medium text-brand-800">
              {t("role_switch")}
            </span>
            {isCoach ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  switchRole("athlete");
                  router.push("/bookings");
                }}
              >
                {t("role_switch_athlete")}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  switchRole("coach");
                  router.push("/coach/dashboard");
                }}
              >
                {t("role_switch_coach")}
              </Button>
            )}
          </div>
        </div>
      </section>

      <Button
        variant="ghost"
        className="mt-6 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        <LogOut className="h-4 w-4" />
        {t("nav_logout")}
      </Button>
    </div>
  );
}
