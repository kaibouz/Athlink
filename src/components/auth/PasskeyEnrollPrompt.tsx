"use client";

import { useEffect, useState } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { Fingerprint, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/provider";
import {
  clerkPasskeysEnabled,
  dismissPasskeyPrompt,
  isPasskeyPromptDismissed,
  markPasskeyPreferred,
  readSaveLoginPreference,
  supportsPlatformAuthenticator,
} from "@/lib/returning-user";

/**
 * Turns "save login info" into an actual one-click return.
 *
 * Shown once, inside the app, right after a sign-in where the member kept the
 * box checked. Registering a passkey needs a click — browsers refuse to open
 * Touch ID / Face ID without one — so this is a button rather than something
 * that fires on its own after login.
 */
export function PasskeyEnrollPrompt() {
  const { t } = useLocale();
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user } = useUser();
  const [eligible, setEligible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    let cancelled = false;
    void (async () => {
      const instanceOn = clerkPasskeysEnabled();
      if (instanceOn === false) return;
      if (!readSaveLoginPreference() || isPasskeyPromptDismissed()) return;
      if ((user.passkeys?.length ?? 0) > 0) return;
      const deviceOk = await supportsPlatformAuthenticator();
      if (!cancelled && deviceOk) setEligible(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user]);

  if (!eligible || done) return null;

  async function enroll() {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      await user.createPasskey();
      markPasskeyPreferred(true);
      dismissPasskeyPrompt();
      setDone(true);
    } catch {
      // Cancelling the system sheet lands here too; leave the offer up.
      setError(t("auth_passkey_enroll_failed"));
    } finally {
      setBusy(false);
    }
  }

  function close() {
    dismissPasskeyPrompt();
    setDone(true);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6">
      <div className="mx-card mx-card-raised flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--mx-accent-soft)] text-[color:var(--mx-blue-2)]">
          <Fingerprint className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-950">{t("auth_passkey_prompt_title")}</p>
          <p className="mt-0.5 text-xs text-brand-500">{t("auth_passkey_prompt_body")}</p>
          {error ? <p className="mt-1 text-xs text-rose-400">{error}</p> : null}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void enroll()}
          className="mx-btn mx-btn-accent shrink-0 border-0"
        >
          <Fingerprint className="h-4 w-4" />
          {busy ? t("loading") : t("auth_enable_biometric")}
        </button>
        <button
          type="button"
          onClick={close}
          className="shrink-0 rounded-md p-1.5 text-brand-500 transition hover:bg-white/5 hover:text-brand-900"
          aria-label={t("auth_passkey_prompt_later")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
