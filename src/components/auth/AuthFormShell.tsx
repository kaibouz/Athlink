"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  IDENTIFIER_LABELS,
  IDENTIFIER_ORDER,
  type IdentifierKind,
} from "@/components/auth/identifier";

function IdentifierToggle({
  active,
  onChange,
}: {
  active: IdentifierKind;
  onChange: (kind: IdentifierKind) => void;
}) {
  const alternatives = IDENTIFIER_ORDER.filter((kind) => kind !== active);

  return (
    <div className="flex flex-wrap items-center justify-end gap-1 text-xs">
      {alternatives.map((kind, index) => (
        <span key={kind} className="inline-flex items-center gap-1">
          {index > 0 ? <span className="text-brand-400">·</span> : null}
          <button
            type="button"
            onClick={() => onChange(kind)}
            className="font-medium text-brand-500 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {IDENTIFIER_LABELS[kind]}
          </button>
        </span>
      ))}
    </div>
  );
}

export function AuthFieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export function AuthFormShell({
  title,
  subtitle,
  identifierKind,
  onIdentifierKindChange,
  footer,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  identifierKind: IdentifierKind;
  onIdentifierKindChange: (kind: IdentifierKind) => void;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("relative w-full max-w-md border-brand-200/60 shadow-lg", className)}>
      <CardBody className="space-y-5 pt-6">
        <div className="space-y-1 pr-28">
          <h1 className="text-xl font-semibold text-brand-950">{title}</h1>
          {subtitle ? <p className="text-sm text-brand-600">{subtitle}</p> : null}
        </div>

        <div className="absolute right-5 top-5">
          <IdentifierToggle active={identifierKind} onChange={onIdentifierKindChange} />
        </div>

        {children}

        {footer}
      </CardBody>
    </Card>
  );
}

export function AuthSwitchLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-center text-sm text-brand-600">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
      >
        {label}
      </Link>
    </p>
  );
}
