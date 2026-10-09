"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/Button";
import { MARKET_TO_PLATFORM } from "@/lib/market-to-platform";

/**
 * In-app account deletion (required by App Store guideline 5.1.1(v)).
 * The member must type DELETE to confirm; the server then deletes or
 * anonymizes the account and ends every session.
 */
export function DeleteAccountSection() {
  const { t } = useLocale();
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/me/account", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE" }),
    }).catch(() => null);
    setBusy(false);

    if (!res || !res.ok) {
      setError(t("account_delete_failed"));
      return;
    }
    await logout();
    router.replace(MARKET_TO_PLATFORM.hq);
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        className="mt-2 justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        {t("account_delete")}
      </Button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-red-500/40 p-4">
      <p className="font-semibold text-red-600">{t("account_delete")}</p>
      <p className="mt-2 text-sm opacity-80">{t("account_delete_body")}</p>
      <label className="mt-4 block text-sm opacity-80" htmlFor="delete-confirm">
        {t("account_delete_type")}
      </label>
      <input
        id="delete-confirm"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-current/20 bg-transparent px-3 py-2 text-sm"
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="danger"
          disabled={typed !== "DELETE" || busy}
          onClick={() => void handleDelete()}
        >
          {t("account_delete_confirm")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setTyped("");
            setError(null);
          }}
        >
          {t("bookings_cancel")}
        </Button>
      </div>
    </div>
  );
}
