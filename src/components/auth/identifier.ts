export type IdentifierKind = "email" | "username" | "phone";

export const IDENTIFIER_LABELS: Record<IdentifierKind, string> = {
  email: "Email",
  username: "Username",
  phone: "Phone",
};

export const IDENTIFIER_ORDER: IdentifierKind[] = ["email", "username", "phone"];

export function formatPhoneE164(countryCode: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  const codeDigits = countryCode.replace(/\D/g, "");
  if (!digits) return "";
  return `+${codeDigits}${digits}`;
}

export function buildSignUpPasswordParams(
  kind: IdentifierKind,
  identifierValue: string,
  password: string,
  phoneCountryCode: string,
) {
  switch (kind) {
    case "email":
      return { emailAddress: identifierValue.trim(), password };
    case "username":
      return { username: identifierValue.trim(), password };
    case "phone":
      return {
        phoneNumber: formatPhoneE164(phoneCountryCode, identifierValue),
        password,
      };
  }
}

export function buildSignInPasswordParams(
  kind: IdentifierKind,
  identifierValue: string,
  password: string,
  phoneCountryCode: string,
) {
  switch (kind) {
    case "email":
      return { emailAddress: identifierValue.trim(), password };
    case "username":
      return { identifier: identifierValue.trim(), password };
    case "phone":
      return {
        phoneNumber: formatPhoneE164(phoneCountryCode, identifierValue),
        password,
      };
  }
}
