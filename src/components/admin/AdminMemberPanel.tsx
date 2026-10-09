"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { useDeferredEffect } from "@/lib/admin/use-deferred-effect";

type Detail = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: "active" | "suspended" | "deleted";
    statusReason: string | null;
    statusChangedAt: string | null;
    createdAt: string;
    signInMethod: "password" | "clerk";
  };
  coach: {
    id: string;
    sport: string;
    city: string;
    bio: { en?: string; ja?: string; es?: string } | string | null;
    specialties: string[] | null;
    pricePerHour: number;
    verified: boolean;
    rating: number;
    reviewCount: number;
  } | null;
  athlete: {
    id: string;
    school: string;
    classYear: string;
    position: string;
    location: string;
    lookingForCoach: boolean;
    openToScouts: boolean;
  } | null;
  guardians: { id: string; guardianName: string; guardianEmail: string; status: string }[];
  bookings: {
    total: number;
    recent: {
      id: string;
      date: string;
      startTime: string;
      coachName: string;
      athleteName: string;
      price: number;
      status: string;
    }[];
  };
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (status === "deleted") {
    return (
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-[var(--admin-text-dim)]">
        Deleted
      </span>
    );
  }
  const suspended = status === "suspended";
  return (
    <span
      className={
        suspended
          ? "rounded-full bg-[#ff5f6d]/15 px-2 py-0.5 text-xs font-medium text-[#ff5f6d]"
          : "rounded-full bg-[#3ddc97]/15 px-2 py-0.5 text-xs font-medium text-[#3ddc97]"
      }
    >
      {suspended ? "Suspended" : "Active"}
    </span>
  );
}

function bioText(bio: { en?: string; ja?: string; es?: string } | string | null | undefined): string {
  if (!bio) return "";
  if (typeof bio === "string") return bio;
  return bio.en || bio.ja || bio.es || "";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--admin-border)] py-2 text-sm last:border-0">
      <dt className="shrink-0 text-[var(--admin-text-dim)]">{label}</dt>
      <dd className="text-right text-[var(--admin-text)]">{value || "—"}</dd>
    </div>
  );
}

/** Slide-over showing one member's registration record, with suspend / resume. */
export function AdminMemberPanel({
  userId,
  onClose,
  onChanged,
}: {
  userId: string;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, { credentials: "include" });
    if (!res.ok) {
      setError(res.status === 404 ? "Member not found" : "Could not load member");
      return;
    }
    setDetail((await res.json()) as Detail);
  }, [userId]);

  useDeferredEffect(() => {
    void load();
  }, [load]);

  async function act(action: "suspend" | "resume") {
    if (action === "suspend" && !window.confirm("Suspend this account? They will be signed out and hidden from the market.")) {
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error === "CANNOT_MODIFY_THIS_USER" ? "Executives and your own account cannot be suspended." : "Update failed");
      return;
    }
    setReason("");
    await load();
    onChanged?.();
  }

  const u = detail?.user;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        className="admin-panel h-full w-full max-w-md overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Member details"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">{u?.name ?? "Member"}</h2>
            <p className="text-sm text-[var(--admin-text-dim)]">{u?.email}</p>
          </div>
          <button type="button" onClick={onClose} className="admin-btn-ghost p-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-[#ff5f6d]">{error}</p> : null}
        {!detail && !error ? <p className="mt-6 text-sm text-[var(--admin-text-dim)]">Loading…</p> : null}

        {detail && u ? (
          <div className="mt-5 space-y-6">
            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-dim)]">Account</h3>
              <dl>
                <Row label="Role" value={<span className="capitalize">{u.role}</span>} />
                <Row label="Status" value={<StatusBadge status={u.status} />} />
                {u.status === "suspended" ? <Row label="Reason" value={u.statusReason} /> : null}
                <Row label="Registered" value={new Date(u.createdAt).toLocaleString()} />
                <Row label="Sign-in" value={u.signInMethod === "clerk" ? "Clerk (Google/email)" : "Email + password"} />
                <Row label="Bookings" value={detail.bookings.total} />
              </dl>
            </section>

            {detail.coach ? (
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-dim)]">Coach profile</h3>
                <dl>
                  <Row label="Sport" value={detail.coach.sport} />
                  <Row label="Area" value={detail.coach.city} />
                  <Row label="Specialties" value={detail.coach.specialties?.join(", ")} />
                  <Row label="Rate" value={`$${detail.coach.pricePerHour}/hr`} />
                  <Row label="Rating" value={`${detail.coach.rating} (${detail.coach.reviewCount})`} />
                  <Row label="Verified badge" value={detail.coach.verified ? "Yes" : "No"} />
                </dl>
                {bioText(detail.coach.bio) ? (
                  <p className="mt-3 whitespace-pre-wrap rounded-lg bg-white/[0.03] p-3 text-sm text-[var(--admin-text-dim)]">
                    {bioText(detail.coach.bio)}
                  </p>
                ) : null}
              </section>
            ) : null}

            {detail.athlete ? (
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-dim)]">Athlete profile</h3>
                <dl>
                  <Row label="School" value={detail.athlete.school} />
                  <Row label="Class" value={detail.athlete.classYear} />
                  <Row label="Position" value={detail.athlete.position} />
                  <Row label="City" value={detail.athlete.location} />
                  <Row label="Seeking coach" value={detail.athlete.lookingForCoach ? "Yes" : "No"} />
                  <Row label="Open to scouts" value={detail.athlete.openToScouts ? "Yes" : "No"} />
                  <Row label="Guardian links" value={detail.guardians.length} />
                </dl>
              </section>
            ) : null}

            {detail.bookings.recent.length > 0 ? (
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-dim)]">Recent bookings</h3>
                <ul className="space-y-1 text-sm">
                  {detail.bookings.recent.map((b) => (
                    <li key={b.id} className="flex justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                      <span className="text-[var(--admin-text-dim)]">
                        {b.date} {b.startTime} · {b.coachName} ↔ {b.athleteName}
                      </span>
                      <span className="capitalize">{b.status}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {u.role !== "executive" && u.status !== "deleted" ? (
              <section className="border-t border-[var(--admin-border)] pt-5">
                {u.status === "suspended" ? (
                  <button type="button" disabled={busy} onClick={() => void act("resume")} className="admin-btn-primary w-full">
                    Resume account
                  </button>
                ) : (
                  <>
                    <label className="mb-1 block text-sm text-[var(--admin-text-dim)]">Reason (optional, internal)</label>
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="admin-input mb-3 w-full rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void act("suspend")}
                      className="admin-btn-ghost w-full text-[#ff5f6d]"
                    >
                      Suspend account
                    </button>
                  </>
                )}
              </section>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
