import { ClerkAuthShell } from "@/components/auth/ClerkAuthShell";
import { ClerkSignInWithIdentifierToggle } from "@/components/auth/ClerkSignInWithIdentifierToggle";

export default function SignInPage() {
  return (
    <ClerkAuthShell>
      <ClerkSignInWithIdentifierToggle />
    </ClerkAuthShell>
  );
}
