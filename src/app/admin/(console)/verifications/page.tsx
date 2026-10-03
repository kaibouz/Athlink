"use client";

import { useCallback, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import {
  ALL_VERIFICATIONS,
  REQUIRED_VERIFICATIONS,
  type VerificationStatus,
  type VerificationType,
} from "@/lib/verification";
import { cn } from "@/lib/utils";

type CoachRow = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  missing: string[];
  expired: string[];
  nextExpiry: string | null;
};

type CheckRow = {
  id: string;
  type: VerificationType;
  status: VerificationStatus;
  provider: string | null;
  reference: string | null;
  checkedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
};

const LABEL_KEY: Record<string, MessageKey> = {
  identity: "vrf_identity",
  criminal_record: "vrf_criminal",
  sex_offender_registry: "vrf_sex_offender",
  safesport_training: "vrf_safesport",
  liability_insurance: "vrf_insurance",
  credential: "vrf_credential",
};

const STATUSES: VerificationStatus[] = ["passed", "pending", "failed"];

export default function AdminVerificationsPage() {
  const { t, locale } = useLocale();
  const dateLocale = locale === "ja" ? "ja-JP" : locale === "es" ? "es-US" : "en-US";

  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checks, setChecks] = useState<CheckRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // form state
  const [type, setType] = useState<VerificationType>("identity");
  const [status, setStatus] = useState<VerificationStatus>("passed");
  const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const loadCoaches = useCallback(async () => {
    const res = await fetch("/api/admin/verifications", { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as { coaches: CoachRow[] };
      setCoaches(data.coaches);
    }
  }, []);

  const loadChecks = useCallback(async (coachId: string) => {
    const res = await fetch(`/api/admin/verifications?coachId=${encodeURIComponent(coachId)}`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = (await res.json()) as { verifications: CheckRow[] };
      setChecks(data.verifications);
    }
  }, []);

  useDeferredEffect(() => {
    void loadCoaches();
  }, [loadCoaches]);

  const activeCoach = useMemo(
    () => coaches.find((c) => c.id === selected) ?? null,
    [coaches, selected],
  );

  function openCoach(id: string) {
    setSelected(id);
    setError("");
    void loadChecks(id);
  }

  async function submit() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          coachId: selected,
          type,
          status,
          provider: provider.trim() || undefined,
          reference: reference.trim() || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "FAILED");
        return;
      }
      setProvider("");
      setReference("");
      setExpiresAt("");
      await Promise.all([loadChecks(selected), loadCoaches()]);
    } finally {
      setBusy(false);
    }
  }

  async function remove(checkType: VerificationType) {
    if (!selected) return;
    setBusy(true);
    try {
      await fetch(
        `/api/admin/verifications?coachId=${encodeURIComponent(selected)}&type=${checkType}`,
        { method: "DELETE", credentials: "include" },
      );
      await Promise.all([loadChecks(selected), loadCoaches()]);
    } finally {
      setBusy(false);
    }
  }

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(dateLocale, { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <div>
      <AdminPageHeader title={t("admin_vrf_title")} subtitle={t("admin_vrf_sub")} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* Roster — badge state is derived, so this is the live picture. */}
        <div className="mx-card !p-0 overflow-hidden">
          <ul className="max-h-[560px] divide-y divide-white/5 overflow-y-auto">
            {coaches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => openCoach(c.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-white/5",
                    selected === c.id && "bg-white/5",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-brand-950">{c.name}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        c.verified
                          ? "bg-[color:var(--mx-blue-2)]/20 text-[color:var(--mx-blue-2)]"
                          : "bg-amber-500/20 text-amber-400",
                      )}
                    >
                      {c.verified ? t("admin_vrf_ok") : t("admin_vrf_incomplete")}
                    </span>
                  </span>
                  <span className="truncate text-xs text-brand-500">{c.email}</span>
                  {!c.verified && c.missing.length > 0 ? (
                    <span className="text-[11px] text-amber-400">
                      {t("admin_vrf_missing_n", { n: c.missing.length })}
                    </span>
                  ) : c.nextExpiry ? (
                    <span className="text-[11px] text-brand-500">
                      {t("admin_vrf_renews", { date: fmt(c.nextExpiry) })}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
            {coaches.length === 0 ? (
              <li className="px-4 py-6 text-sm text-brand-500">{t("admin_vrf_no_coaches")}</li>
            ) : null}
          </ul>
        </div>

        <div className="space-y-4">
          {!activeCoach ? (
            <div className="mx-card text-sm text-brand-500">{t("admin_vrf_pick")}</div>
          ) : (
            <>
              <div className="mx-card">
                <div className="mx-t">{t("admin_vrf_record")}</div>
                <p className="mb-3 text-sm font-semibold text-brand-950">{activeCoach.name}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs text-brand-500">{t("admin_vrf_type")}</span>
                    <select
                      className="mx-input w-full"
                      value={type}
                      onChange={(e) => setType(e.target.value as VerificationType)}
                    >
                      {ALL_VERIFICATIONS.map((v) => (
                        <option key={v} value={v}>
                          {t(LABEL_KEY[v])}
                          {REQUIRED_VERIFICATIONS.includes(v) ? "" : ` (${t("vrf_optional")})`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-brand-500">{t("admin_vrf_status")}</span>
                    <select
                      className="mx-input w-full"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as VerificationStatus)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`admin_vrf_status_${s}` as MessageKey)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-brand-500">{t("admin_vrf_provider")}</span>
                    <input
                      className="mx-input w-full"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      placeholder="Checkr"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-brand-500">{t("admin_vrf_reference")}</span>
                    <input
                      className="mx-input w-full"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="rep_0f3a…"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs text-brand-500">
                      {t("admin_vrf_expires")}
                    </span>
                    <input
                      type="date"
                      className="mx-input w-full"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                    <span className="mt-1 block text-[11px] text-brand-500">
                      {t("admin_vrf_expires_hint")}
                    </span>
                  </label>
                </div>

                {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void submit()}
                  className="mx-btn mx-btn-accent mt-4 border-0"
                >
                  {busy ? t("loading") : t("admin_vrf_save")}
                </button>
              </div>

              <div className="mx-card">
                <div className="mx-t">{t("admin_vrf_recorded")}</div>
                {checks.length === 0 ? (
                  <p className="text-sm text-brand-500">{t("admin_vrf_none")}</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {checks.map((c) => (
                      <li key={c.id} className="flex items-start gap-3 py-3">
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-brand-950">
                            {t(LABEL_KEY[c.type])}
                          </span>
                          <span className="block text-xs text-brand-500">
                            {t(`admin_vrf_status_${c.status}` as MessageKey)}
                            {c.provider ? ` · ${c.provider}` : ""}
                            {c.reference ? ` · ${c.reference}` : ""}
                          </span>
                          <span className="block text-xs text-brand-500">
                            {t("admin_vrf_checked")}: {fmt(c.checkedAt)} ·{" "}
                            {t("admin_vrf_expires")}: {fmt(c.expiresAt)}
                          </span>
                        </span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void remove(c.type)}
                          className="shrink-0 text-xs font-semibold text-rose-400 hover:underline"
                        >
                          {t("admin_vrf_delete")}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
