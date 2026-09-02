import { SignUp } from "@clerk/nextjs";
import { ClerkAuthShell } from "@/components/auth/ClerkAuthShell";
import { clerkAuthAppearance } from "@/components/auth/clerkAppearance";

export default function SignUpPage() {
  return (
    <ClerkAuthShell>
      <SignUp appearance={clerkAuthAppearance} />
    </ClerkAuthShell>
  );
}
