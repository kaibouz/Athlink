"use client";

import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

type ClerkNavAuthProps = {
  loginLabel: string;
  /** Shown on /sign-in so the header isn’t a second “Log in” next to Clerk’s Sign in. */
  signupLabel?: string;
  compact?: boolean;
};

/**
 * Signed-out chrome:
 * - /sign-in → Sign up (complement; Sign in is already the page)
 * - /sign-up → Log in / Sign in
 * - elsewhere → Log in
 *
 * “Sign in” and “Log in” mean the same thing; we keep “Log in” in product nav
 * and let Clerk’s card say “Sign in”.
 */
export function ClerkNavAuth({ loginLabel, signupLabel, compact }: ClerkNavAuthProps) {
  const pathname = usePathname();
  const onSignIn = pathname === "/sign-in" || pathname.startsWith("/sign-in/");

  return (
    <div className={compact ? "flex items-center gap-1" : "flex items-center gap-2"}>
      <Show when="signed-out">
        {onSignIn && signupLabel ? (
          <SignUpButton mode="redirect">
            <Button variant="ghost" size="sm">
              {signupLabel}
            </Button>
          </SignUpButton>
        ) : (
          <SignInButton mode="redirect">
            <Button variant="ghost" size="sm">
              {loginLabel}
            </Button>
          </SignInButton>
        )}
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: compact ? "h-8 w-8" : "h-9 w-9",
            },
          }}
        />
      </Show>
    </div>
  );
}
