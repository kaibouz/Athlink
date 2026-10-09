import { SignUp } from "@clerk/nextjs";
import { ClerkAuthShell } from "@/components/auth/ClerkAuthShell";
import { clerkAuthAppearance } from "@/components/auth/clerkAppearance";
import { safeRedirectPath } from "@/lib/market-to-platform";

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirectUrl = safeRedirectPath(params.redirect_url);

  return (
    <ClerkAuthShell>
      <SignUp
        appearance={clerkAuthAppearance}
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
        signInForceRedirectUrl={redirectUrl}
        signInFallbackRedirectUrl={redirectUrl}
      />
    </ClerkAuthShell>
  );
}
