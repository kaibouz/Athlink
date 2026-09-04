#!/usr/bin/env bash
# Per-boot startup for the AthLink Cloud Agent environment.
# Brings up PostgreSQL and waits until it is ready to accept connections.
set -euo pipefail

echo "==> Starting PostgreSQL"
if ! sudo -u postgres pg_isready -q 2>/dev/null; then
  sudo pg_ctlcluster 16 main start 2>/dev/null || true
fi

for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q 2>/dev/null; then
    echo "==> PostgreSQL is ready"
    exit 0
  fi
  sleep 1
done

echo "!! PostgreSQL did not become ready in time" >&2
exit 1
