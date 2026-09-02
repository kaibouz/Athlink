"use client";

import { useAuth, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  AuthFieldError,
  AuthFormShell,
  AuthSwitchLink,
} from "@/components/auth/AuthFormShell";
import { createAuthFinalizeNavigate } from "@/components/auth/authNavigation";
import {
  buildSignUpPasswordParams,
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

export function ClerkSignUpWithIdentifierToggle() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const finalizeNavigate = useCallback(createAuthFinalizeNavigate(router), [router]);

  const [identifierKind, setIdentifierKind] = useState<IdentifierKind>("email");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [formKey, setFormKey] = useState(0);

  const isBusy = fetchStatus === "fetching";

  const handleIdentifierKindChange = async (kind: IdentifierKind) => {
    if (kind === identifierKind) return;
    await signUp.reset();
    setIdentifierKind(kind);
    setFormKey((value) => value + 1);
  };

  const handleSubmit = async (formData: FormData) => {
    const password = formData.get("password") as string;
    const identifierValue = formData.get("identifier") as string;

    const { error } = await signUp.password(
      buildSignUpPasswordParams(identifierKind, identifierValue, password, phoneCountryCode),
    );
    if (error) return;

    if (signUp.unverifiedFields.includes("email_address")) {
      await signUp.verifications.sendEmailCode();
      return;
    }

    if (signUp.unverifiedFields.includes("phone_number")) {
      await signUp.verifications.sendPhoneCode();
    }
  };

  const handleVerify = async (formData: FormData) => {
    const code = formData.get("code") as string;

    if (signUp.unverifiedFields.includes("email_address")) {
      await signUp.verifications.verifyEmailCode({ code });
    } else if (signUp.unverifiedFields.includes("phone_number")) {
      await signUp.verifications.verifyPhoneCode({ code });
    }

    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: finalizeNavigate });
    }
  };

  const handleContinue = async (formData: FormData) => {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const username = formData.get("username") as string;

    await signUp.update({
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(username ? { username } : {}),
    });

    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: finalizeNavigate });
    }
  };

  const handleResendCode = async () => {
    if (signUp.unverifiedFields.includes("email_address")) {
      await signUp.verifications.sendEmailCode();
      return;
    }
    if (signUp.unverifiedFields.includes("phone_number")) {
      await signUp.verifications.sendPhoneCode();
    }
  };

  const handleStartOver = async () => {
    await signUp.reset();
    setFormKey((value) => value + 1);
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.missingFields.length === 0 &&
    (signUp.unverifiedFields.includes("email_address") ||
      signUp.unverifiedFields.includes("phone_number"));

  const needsAdditionalFields =
    signUp.status === "missing_requirements" && signUp.missingFields.length > 0;

  if (needsVerification) {
    const verificationTarget =
      signUp.unverifiedFields.includes("phone_number") ? "phone number" : "email";

    return (
      <AuthFormShell
        title="Verify your account"
        subtitle={`Enter the code sent to your ${verificationTarget}.`}
        identifierKind={identifierKind}
        onIdentifierKindChange={handleIdentifierKindChange}
        footer={
          <AuthSwitchLink prompt="Already have an account?" href="/sign-in" label="Sign in" />
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

  if (needsAdditionalFields) {
    return (
      <AuthFormShell
        title="Complete your profile"
        subtitle="A few more details are required to finish creating your account."
        identifierKind={identifierKind}
        onIdentifierKindChange={handleIdentifierKindChange}
      >
        <form action={handleContinue} className="space-y-4">
          {signUp.missingFields.includes("first_name") ? (
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" autoComplete="given-name" required />
              <AuthFieldError message={errors.fields.firstName?.message} />
            </div>
          ) : null}

          {signUp.missingFields.includes("last_name") ? (
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" autoComplete="family-name" required />
              <AuthFieldError message={errors.fields.lastName?.message} />
            </div>
          ) : null}

          {signUp.missingFields.includes("username") ? (
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" autoComplete="username" required />
              <AuthFieldError message={errors.fields.username?.message} />
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isBusy}>
            {isBusy ? "Saving…" : "Continue"}
          </Button>
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
      title="Create your account"
      subtitle={`Sign up with your ${identifierLabel.toLowerCase()}.`}
      identifierKind={identifierKind}
      onIdentifierKindChange={handleIdentifierKindChange}
      footer={
        <AuthSwitchLink prompt="Already have an account?" href="/sign-in" label="Sign in" />
      }
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
          <AuthFieldError
            message={
              errors.fields.emailAddress?.message ??
              errors.fields.username?.message ??
              errors.fields.phoneNumber?.message
            }
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          <AuthFieldError message={errors.fields.password?.message} />
        </div>

        {errors.fields.captcha?.message ? (
          <AuthFieldError message={errors.fields.captcha.message} />
        ) : null}

        {errors.global?.[0]?.message ? (
          <AuthFieldError message={errors.global[0].message} />
        ) : null}

        <Button type="submit" className="w-full" disabled={isBusy}>
          {isBusy ? "Creating account…" : "Continue"}
        </Button>

        <div id="clerk-captcha" />
      </form>

      <p className="text-center text-xs text-brand-500">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline-offset-2 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthFormShell>
  );
}
