const DEFAULT_EXECUTIVE_DOMAINS = ["athlink.com", "athlink.app"];

export function executiveEmailDomains(): string[] {
  const raw = process.env.EXECUTIVE_EMAIL_DOMAINS?.trim();
  if (!raw) return DEFAULT_EXECUTIVE_DOMAINS;
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export function isExecutiveEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return executiveEmailDomains().includes(domain);
}

export function isBootstrapSecretValid(secret: string | undefined | null): boolean {
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();
  if (!expected || !secret) return false;
  return secret.trim() === expected;
}
