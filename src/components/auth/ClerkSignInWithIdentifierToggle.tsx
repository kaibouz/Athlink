"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  AuthFieldError,
  AuthFormShell,
  AuthSwitchLink,
} from "@/components/auth/AuthFormShell";
import { createAuthFinalizeNavigate } from "@/components/auth/authNavigation";
import {
  buildSignInPasswordParams,
  IDENTIFIER_LABELS,
  type IdentifierKind,
} from "@/components/auth/identifier";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";

const PHONE_COUNTRY_OPTIONS = [
  { code: "+1", label: "US +1" },
  { code: "+1", label: "CA +1" },
  { code: "+81", label: "JP +81" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
];

export function ClerkSignInWithIdentifierToggle() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const finalizeNavigate = useCallback(createAuthFinalizeNavigate(router), [router]);

  const [identifierKind, setIdentifierKind] = useState<IdentifierKind>("email");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [formKey, setFormKey] = useState(0);

  const isBusy = fetchStatus === "fetching";

  const handleIdentifierKindChange = async (kind: IdentifierKind) => {
    if (kind === identifierKind) return;
    await signIn.reset();
    setIdentifierKind(kind);
    setFormKey((value) => value + 1);
  };

  const handleSubmit = async (formData: FormData) => {
    const password = formData.get("password") as string;
    const identifierValue = formData.get("identifier") as string;

    const { error } = await signIn.password(
      buildSignInPasswordParams(identifierKind, identifierValue, password, phoneCountryCode),
    );
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: finalizeNavigate });
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }
  };

  const handleVerify = async (formData: FormData) => {
    const code = formData.get("code") as string;
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: finalizeNavigate });
    }
  };

  const handleResendCode = async () => {
    await signIn.mfa.sendEmailCode();
  };

  const handleStartOver = async () => {
    await signIn.reset();
    setFormKey((value) => value + 1);
  };

  if (signIn.status === "complete" || isSignedIn) {
    return null;
  }

  if (signIn.status === "needs_client_trust") {
    return (
      <AuthFormShell
        title="Verify your device"
        subtitle="Enter the verification code sent to your email."
        identifierKind={identifierKind}
        onIdentifierKindChange={handleIdentifierKindChange}
        footer={
          <AuthSwitchLink prompt="Need an account?" href="/sign-up" label="Sign up" />
        }
      >
        <form action={handleVerify} className="space-y-4">
          <div>
            <Label htmlFor="code">Verification code</Label>
            <Input id="code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" required />
            <AuthFieldError message={errors.fields.code?.message} />
          </div>

          <Button type="submit" className="w-full" disabled={isBusy}>
            {isBusy ? "Verifying…" : "Verify"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isBusy}
              className="text-brand-600 hover:underline disabled:opacity-50 dark:text-brand-400"
            >
              Send a new code
            </button>
            <button
              type="button"
              onClick={handleStartOver}
              disabled={isBusy}
              className="text-brand-600 hover:underline disabled:opacity-50 dark:text-brand-400"
            >
              Start over
            </button>
          </div>
        </form>
      </AuthFormShell>
    );
  }

  const identifierLabel = IDENTIFIER_LABELS[identifierKind];
  const identifierAutoComplete =
    identifierKind === "email"
      ? "email"
      : identifierKind === "username"
        ? "username"
        : "tel";

  return (
    <AuthFormShell
      title="Welcome back"
      subtitle={`Sign in with your ${identifierLabel.toLowerCase()}.`}
      identifierKind={identifierKind}
      onIdentifierKindChange={handleIdentifierKindChange}
      footer={<AuthSwitchLink prompt="Need an account?" href="/sign-up" label="Sign up" />}
    >
      <form key={formKey} action={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="identifier">{identifierLabel}</Label>
          {identifierKind === "phone" ? (
            <div className="flex gap-2">
              <Select
                aria-label="Country code"
                value={phoneCountryCode}
                onChange={(event) => setPhoneCountryCode(event.target.value)}
                className="w-[7.5rem] shrink-0 px-2"
              >
                {PHONE_COUNTRY_OPTIONS.map((option) => (
                  <option key={`${option.label}-${option.code}`} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Input
                id="identifier"
                name="identifier"
                type="tel"
                autoComplete={identifierAutoComplete}
                placeholder="Enter your phone number"
                required
                className="min-w-0 flex-1"
              />
            </div>
          ) : (
            <Input
              id="identifier"
              name="identifier"
              type={identifierKind === "email" ? "email" : "text"}
              autoComplete={identifierAutoComplete}
              placeholder={
                identifierKind === "email"
                  ? "Enter your email address"
                  : "Enter your username"
              }
              required
            />
          )}
          <AuthFieldError message={errors.fields.identifier?.message} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
          <AuthFieldError message={errors.fields.password?.message} />
        </div>

        {errors.global?.[0]?.message ? (
          <AuthFieldError message={errors.global[0].message} />
        ) : null}

        <Button type="submit" className="w-full" disabled={isBusy}>
          {isBusy ? "Signing in…" : "Continue"}
        </Button>

        <div id="clerk-captcha" />
      </form>
    </AuthFormShell>
  );
}
