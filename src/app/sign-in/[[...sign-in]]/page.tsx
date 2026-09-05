import { SignIn } from "@clerk/nextjs";
import { ClerkAuthShell } from "@/components/auth/ClerkAuthShell";
import { clerkAuthAppearance } from "@/components/auth/clerkAppearance";

export default function SignInPage() {
  return (
    <ClerkAuthShell>
      <SignIn
        appearance={clerkAuthAppearance}
        forceRedirectUrl="/app"
        fallbackRedirectUrl="/app"
        signUpForceRedirectUrl="/app"
        signUpFallbackRedirectUrl="/app"
      />
    </ClerkAuthShell>
  );
}
