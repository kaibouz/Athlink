import { SignIn } from "@clerk/nextjs";
import { ClerkAuthShell } from "@/components/auth/ClerkAuthShell";
import { clerkAuthAppearance } from "@/components/auth/clerkAppearance";
import { safeRedirectPath } from "@/lib/market-to-platform";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectUrl = safeRedirectPath(params.redirect_url);

  return (
    <ClerkAuthShell>
      <SignIn
        appearance={clerkAuthAppearance}
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
        signUpForceRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl={redirectUrl}
      />
    </ClerkAuthShell>
  );
}
