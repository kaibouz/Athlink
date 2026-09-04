"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

type ClerkNavAuthProps = {
  loginLabel: string;
  compact?: boolean;
};

export function ClerkNavAuth({ loginLabel, compact }: ClerkNavAuthProps) {
  return (
    <div className={compact ? "flex items-center gap-1" : "flex items-center gap-2"}>
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <Button variant="ghost" size="sm">
            {loginLabel}
          </Button>
        </SignInButton>
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
