"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Fingerprint } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import {
  clerkPasskeysEnabled,
  markPasskeyPreferred,
  readSaveLoginPreference,
  setSaveLoginPreference,
  supportsPlatformAuthenticator,
} from "@/lib/returning-user";

type ClerkPasskey = { id: string; delete: () => Promise<unknown> };

/**
 * Account settings home for one-click return: keep this device signed in, and
 * register Face ID / Touch ID so the next visit skips the email code.
 *
 * Enrolment has to start from a click — browsers refuse to open a biometric
 * prompt otherwise — so it lives here as well as in the one-off prompt after
 * sign-in. Hidden when the device or the Clerk instance can't do passkeys.
 */
export function BiometricLoginSettings() {
  const { t } = useLocale();
  const { user: clerkUser, isLoaded } = useUser();
  const [saveLogin, setSaveLogin] = useState(true);
  const [deviceOk, setDeviceOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Local delta on top of Clerk's list, so the row updates the moment an
  // enrolment or removal finishes instead of waiting for a user refetch.
  const [changed, setChanged] = useState<number | null>(null);
  const enrolled = changed ?? clerkUser?.passkeys?.length ?? 0;

  useEffect(() => {
    let cancelled = false;
    // Both reads touch the browser (localStorage, WebAuthn), so they run after
    // paint rather than during the effect body.
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      setSaveLogin(readSaveLoginPreference());
      void (async () => {
        const ok = await supportsPlatformAuthenticator();
        if (!cancelled && ok && clerkPasskeysEnabled() !== false) setDeviceOk(true);
      })();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!isLoaded || !clerkUser) return null;

  async function enroll() {
    if (!clerkUser) return;
    setBusy(true);
    setError("");
    try {
      await clerkUser.createPasskey();
      markPasskeyPreferred(true);
      setChanged(enrolled + 1);
    } catch {
      setError(t("auth_passkey_enroll_failed"));
    } finally {
      setBusy(false);
    }
  }

  async function removeAll() {
    if (!clerkUser) return;
    setBusy(true);
    setError("");
    try {
      const keys = (clerkUser.passkeys ?? []) as unknown as ClerkPasskey[];
      await Promise.all(keys.map((k) => k.delete()));
      markPasskeyPreferred(false);
      setChanged(0);
    } catch {
      setError(t("auth_passkey_enroll_failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-brand-100 pt-4">
      <span className="mb-1.5 block text-sm font-medium text-brand-800">{t("login_title")}</span>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-700">
        <input
          type="checkbox"
          checked={saveLogin}
          onChange={(e) => {
            setSaveLogin(e.target.checked);
            setSaveLoginPreference(e.target.checked);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
        />
        <span>
          {t("auth_save_login")}
          <span className="mt-0.5 block text-xs text-brand-500">{t("auth_save_login_hint")}</span>
        </span>
      </label>

      {deviceOk ? (
        <div className="mt-3">
          {enrolled > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-brand-700">
                <Fingerprint className="h-4 w-4 text-brand-600" />
                {t("auth_biometric_on")}
              </span>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => void removeAll()}>
                {t("bookings_cancel")}
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={busy}
                onClick={() => void enroll()}
              >
                <Fingerprint className="h-4 w-4" />
                {t("auth_enable_biometric")}
              </Button>
              <p className="mt-1.5 text-xs text-brand-500">{t("auth_passkey_hint")}</p>
            </>
          )}
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
