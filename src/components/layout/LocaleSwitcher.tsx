"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { UI_LOCALES, UI_LOCALE_LABELS, type UiLocale } from "@/lib/i18n/messages";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className="inline-flex items-center gap-1.5" title={t("site_language")}>
      {!compact && <Languages className="h-4 w-4 text-brand-500" aria-hidden />}
      <span className="sr-only">{t("site_language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as UiLocale)}
        aria-label={t("site_language")}
        className="h-9 rounded-lg border border-brand-200 bg-surface px-2 text-sm font-medium text-brand-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        {UI_LOCALES.map((code) => (
          <option key={code} value={code}>
            {UI_LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
