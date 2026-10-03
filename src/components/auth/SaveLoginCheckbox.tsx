"use client";

import { useEffect, useId, useState } from "react";
import { Fingerprint } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { readSaveLoginPreference, setSaveLoginPreference } from "@/lib/returning-user";

/**
 * "Save login info on this device" — sits under the Clerk card.
 *
 * Checked: after sign-in this device remembers the account, and (once passkeys
 * are enabled) offers Touch ID / Face ID so the next visit is one click.
 * Unchecked: nothing about the account is kept on the device.
 */
export function SaveLoginCheckbox() {
  const { t } = useLocale();
  const id = useId();
  const [checked, setChecked] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setChecked(readSaveLoginPreference()));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <label
      htmlFor={id}
      className="mx-auto mt-4 flex w-full max-w-[420px] cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[color:var(--mx-panel)] px-4 py-3"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          setSaveLoginPreference(e.target.checked);
        }}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--mx-blue-1)]"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-950">
          <Fingerprint className="h-3.5 w-3.5 text-[color:var(--mx-blue-2)]" />
          {t("auth_save_login")}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-brand-500">
          {t("auth_save_login_hint")}
        </span>
      </span>
    </label>
  );
}
