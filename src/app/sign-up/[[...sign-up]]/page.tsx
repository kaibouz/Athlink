import { ClerkAuthShell } from "@/components/auth/ClerkAuthShell";
import { ClerkSignUpWithIdentifierToggle } from "@/components/auth/ClerkSignUpWithIdentifierToggle";

export default function SignUpPage() {
  return (
    <ClerkAuthShell>
      <ClerkSignUpWithIdentifierToggle />
    </ClerkAuthShell>
  );
}
