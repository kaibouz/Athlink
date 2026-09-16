"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth as useClerkAuth, useSignIn, useUser } from "@clerk/nextjs";
import { Fingerprint, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { signInHref } from "@/lib/market-to-platform";
import {
  markPasskeyPreferred,
  myPageHrefForRole,
  readReturningUser,
  supportsPlatformAuthenticator,
  type ReturningUserProfile,
} from "@/lib/returning-user";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

/**
 * After first login: one cursor action opens My Page when the session is live.
 * When signed out but remembered, try passkey / platform biometric, else sign-in.
 * Clerk v7 custom flow: `signIn.passkey()` → `signIn.finalize()`.
 */
export function QuickMyPageEntry({ className, compact = false }: Props) {
  const { t } = useLocale();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signIn } = useSignIn();
  const { user, hydrated } = useAuth();
  const [remembered, setRemembered] = useState<ReturningUserProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passkeyOk, setPasskeyOk] = useState(false);

  useEffect(() => {
    setRemembered(readReturningUser());
    void supportsPlatformAuthenticator().then(setPasskeyOk);
  }, [isSignedIn, user?.id]);

  const myHref =
    remembered?.myPageHref ?? (user ? myPageHrefForRole(user.role) : "/me");

  const goMyPage = useCallback(() => {
    router.push(myHref);
  }, [router, myHref]);

  const tryPasskeyThenMyPage = useCallback(async () => {
    setError(null);
    if (!signIn) {
      router.push(signInHref(myHref));
      return;
    }
    setBusy(true);
    try {
      const { error: passkeyError } = await signIn.passkey({
        flow: remembered?.preferPasskey ? "discoverable" : "autofill",
      });
      if (passkeyError) {
        throw passkeyError;
      }
      if (signIn.status === "complete") {
        markPasskeyPreferred(true);
        const { error: finalizeError } = await signIn.finalize({
          navigate: async ({ decorateUrl }) => {
            const url = decorateUrl(myHref);
            if (url.startsWith("http://") || url.startsWith("https://")) {
              window.location.href = url;
              return;
            }
            router.replace(url || myHref);
          },
        });
        if (finalizeError) {
          throw finalizeError;
        }
        return;
      }
      router.push(signInHref(myHref));
    } catch {
      setError(t("auth_passkey_failed"));
      router.push(signInHref(myHref));
    } finally {
      setBusy(false);
    }
  }, [signIn, remembered?.preferPasskey, router, myHref, t]);

  const enrollPasskey = useCallback(async () => {
    if (!clerkUser) return;
    setBusy(true);
    setError(null);
    try {
      await clerkUser.createPasskey();
      markPasskeyPreferred(true);
      setRemembered(readReturningUser());
    } catch {
      setError(t("auth_passkey_enroll_failed"));
    } finally {
      setBusy(false);
    }
  }, [clerkUser, t]);

  if (!hydrated || !isLoaded) return null;

  if (isSignedIn) {
    const displayName = user?.name || clerkUser?.fullName || remembered?.name || "Athlink";
    const avatar =
      user?.avatarUrl ||
      clerkUser?.imageUrl ||
      remembered?.avatarUrl ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;
    const hasPasskeys = (clerkUser?.passkeys?.length ?? 0) > 0;

    if (compact) {
      return (
        <Link
          href={myHref}
          className={cn(
            "glass-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-950 transition hover:border-white/40",
            className,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
          {t("auth_my_page")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      );
    }

    return (
      <div className={cn("glass-panel glass-panel-scrim rounded-2xl p-4", className)}>
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="" className="h-11 w-11 rounded-full bg-brand-50 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand-950">{displayName}</p>
            <p className="truncate text-xs text-brand-500">{t("auth_session_saved")}</p>
          </div>
          <Button size="sm" onClick={goMyPage} className="shrink-0">
            {t("auth_go_my_page")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {passkeyOk && !hasPasskeys ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void enrollPasskey()}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-brand-800 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            <Fingerprint className="h-3.5 w-3.5" />
            {t("auth_enable_biometric")}
          </button>
        ) : null}
        {passkeyOk && hasPasskeys ? (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("auth_biometric_on")}
          </p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
      </div>
    );
  }

  if (!remembered) return null;

  const firstName = remembered.name.split(" ")[0] || remembered.name;
  const avatar =
    remembered.avatarUrl ||
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(remembered.name)}`;

  if (compact) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void tryPasskeyThenMyPage()}
        className={cn(
          "glass-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-950 transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50",
          className,
        )}
      >
        {passkeyOk ? <Fingerprint className="h-3.5 w-3.5" /> : null}
        {t("auth_continue_as", { name: firstName })}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className={cn("glass-panel glass-panel-scrim rounded-2xl p-4", className)}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt="" className="h-11 w-11 rounded-full bg-brand-50 object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-brand-950">{remembered.name}</p>
          <p className="truncate text-xs text-brand-500">{t("auth_tap_to_return")}</p>
        </div>
        <Button size="sm" disabled={busy} onClick={() => void tryPasskeyThenMyPage()}>
          {passkeyOk ? <Fingerprint className="h-3.5 w-3.5" /> : null}
          {t("auth_go_my_page")}
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
      <p className="mt-2 text-[11px] text-brand-500">
        {passkeyOk ? t("auth_passkey_hint") : t("auth_saved_device_hint")}
      </p>
    </div>
  );
}
