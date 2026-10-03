/**
 * What "Verified" means on AthlinkPro.
 *
 * The badge is shown to parents of minor athletes, so it is derived from
 * recorded checks rather than set by hand. A coach is verified only while every
 * required check is passed and unexpired; anything missing or lapsed drops the
 * badge automatically on the next read.
 *
 * The required set mirrors what this market treats as table stakes (identity,
 * criminal record and sex-offender screening, renewed annually) plus the
 * abuse-prevention training the Safe Sport Authorization Act expects of
 * businesses whose coaches have regular contact with minors.
 */

export type VerificationType =
  | "identity"
  | "criminal_record"
  | "sex_offender_registry"
  | "liability_insurance"
  | "safesport_training"
  | "credential";

export type VerificationStatus = "pending" | "passed" | "failed" | "expired";

export interface VerificationRecord {
  type: VerificationType;
  status: VerificationStatus;
  provider?: string | null;
  checkedAt?: Date | string | null;
  expiresAt?: Date | string | null;
}

/** Checks a coach must hold before the badge appears. */
export const REQUIRED_VERIFICATIONS: VerificationType[] = [
  "identity",
  "criminal_record",
  "sex_offender_registry",
  "safesport_training",
];

/** Shown on the profile but not blocking — useful signal, not a gate. */
export const OPTIONAL_VERIFICATIONS: VerificationType[] = [
  "liability_insurance",
  "credential",
];

export const ALL_VERIFICATIONS: VerificationType[] = [
  ...REQUIRED_VERIFICATIONS,
  ...OPTIONAL_VERIFICATIONS,
];

/** Industry norm for screening is a 12-month re-check. */
export const RENEWAL_MONTHS = 12;

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** A record counts only while it is passed and has not lapsed. */
export function isActive(record: VerificationRecord, now = new Date()): boolean {
  if (record.status !== "passed") return false;
  const expires = asDate(record.expiresAt);
  return !expires || expires > now;
}

/** Passed but lapsed — the coach needs to renew. */
export function isExpired(record: VerificationRecord, now = new Date()): boolean {
  if (record.status === "expired") return true;
  if (record.status !== "passed") return false;
  const expires = asDate(record.expiresAt);
  return Boolean(expires && expires <= now);
}

/** One row as the profile shows it: what was checked, by whom, and until when. */
export interface VerificationDetail {
  type: VerificationType;
  required: boolean;
  state: "active" | "expired" | "missing" | "pending" | "failed";
  provider: string | null;
  checkedAt: string | null;
  expiresAt: string | null;
}

export interface VerificationSummary {
  /** True only when every required check is active. */
  verified: boolean;
  active: VerificationType[];
  missing: VerificationType[];
  expired: VerificationType[];
  /** Soonest upcoming expiry among active required checks. */
  nextExpiry: Date | null;
  /** Every check in display order, including ones never submitted. */
  details: VerificationDetail[];
}

export function summarize(
  records: VerificationRecord[],
  now = new Date(),
): VerificationSummary {
  const byType = new Map<VerificationType, VerificationRecord>();
  for (const r of records) {
    // Keep the strongest record per type: an active one always wins.
    const prev = byType.get(r.type);
    if (!prev || (isActive(r, now) && !isActive(prev, now))) byType.set(r.type, r);
  }

  const active: VerificationType[] = [];
  const expired: VerificationType[] = [];
  const missing: VerificationType[] = [];
  let nextExpiry: Date | null = null;

  for (const type of ALL_VERIFICATIONS) {
    const record = byType.get(type);
    if (!record) {
      if (REQUIRED_VERIFICATIONS.includes(type)) missing.push(type);
      continue;
    }
    if (isActive(record, now)) {
      active.push(type);
      const exp = asDate(record.expiresAt);
      if (exp && REQUIRED_VERIFICATIONS.includes(type)) {
        if (!nextExpiry || exp < nextExpiry) nextExpiry = exp;
      }
    } else if (isExpired(record, now)) {
      expired.push(type);
      if (REQUIRED_VERIFICATIONS.includes(type)) missing.push(type);
    } else if (REQUIRED_VERIFICATIONS.includes(type)) {
      missing.push(type);
    }
  }

  const iso = (v: Date | string | null | undefined) => {
    const d = asDate(v);
    return d ? d.toISOString() : null;
  };

  const details: VerificationDetail[] = ALL_VERIFICATIONS.map((type) => {
    const record = byType.get(type);
    const required = REQUIRED_VERIFICATIONS.includes(type);
    if (!record) {
      return { type, required, state: "missing", provider: null, checkedAt: null, expiresAt: null };
    }
    const state: VerificationDetail["state"] = isActive(record, now)
      ? "active"
      : isExpired(record, now)
        ? "expired"
        : record.status === "failed"
          ? "failed"
          : "pending";
    return {
      type,
      required,
      state,
      provider: record.provider ?? null,
      checkedAt: iso(record.checkedAt),
      expiresAt: iso(record.expiresAt),
    };
  });

  return {
    verified: REQUIRED_VERIFICATIONS.every((t) => active.includes(t)),
    active,
    missing,
    expired,
    nextExpiry,
    details,
  };
}

/** Default expiry for a check recorded now. */
export function defaultExpiry(from = new Date()): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + RENEWAL_MONTHS);
  return d;
}
