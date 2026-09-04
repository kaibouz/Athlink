#!/usr/bin/env bash
# Idempotent repository bootstrap for the AthLink Cloud Agent environment.
# Runs after the repository is checked out. Safe to run repeatedly.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Installing Node dependencies"
npm ci

echo "==> Ensuring PostgreSQL 16 is installed"
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
fi

echo "==> Starting PostgreSQL"
sudo pg_ctlcluster 16 main start 2>/dev/null || true
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q 2>/dev/null; then break; fi
  sleep 1
done

echo "==> Ensuring 'athlink' role and database exist"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='athlink') THEN CREATE ROLE athlink LOGIN PASSWORD 'athlink'; END IF; END \$\$;"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='athlink'" | grep -q 1; then
  sudo -u postgres createdb -O athlink athlink
fi

echo "==> Ensuring .env.local exists"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  SECRET="$(openssl rand -base64 32)"
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=${SECRET}|" .env.local
  # Drop the empty Clerk placeholders so keyless dev provisioning can populate them.
  sed -i '/^CLERK_SECRET_KEY=$/d; /^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$/d' .env.local
fi

# Provision Clerk keyless development keys when no real keys are supplied.
# If NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY are provided as
# environment secrets they take precedence and this block is skipped.
if [ -z "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}" ] && ! grep -q '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' .env.local; then
  echo "==> Provisioning Clerk keyless development keys"
  npx --yes clerk@latest init >/dev/null 2>&1 || true
fi

echo "==> Applying database schema (drizzle push)"
npm run db:push

echo "==> Seeding demo data"
npm run db:seed

echo "==> Install complete"
