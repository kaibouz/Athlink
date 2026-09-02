"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, X } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { UI_LOCALES, UI_LOCALE_LABELS, type UiLocale } from "@/lib/i18n/messages";
import { CalendarAutoPrefSelect } from "@/components/calendar/AddToCalendar";
import { Button } from "@/components/ui/Button";

export function AppSettingsPanel({
  showRoleSwitch = true,
  onClose,
}: {
  showRoleSwitch?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const { user, switchRole, logout } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const isCoach = user?.role === "coach";

  return (
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

      <CalendarAutoPrefSelect />

      {showRoleSwitch && user && (
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
      )}

      {user && (
        <div className="border-t border-brand-100 pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              logout();
              onClose?.();
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4" />
            {t("nav_logout")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AppSettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("me_settings")}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold text-brand-950">{t("me_settings")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-500 hover:bg-brand-50"
            aria-label={t("records_map_close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <AppSettingsPanel onClose={onClose} />
      </div>
    </div>
  );
}
