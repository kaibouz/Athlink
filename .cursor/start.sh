#!/usr/bin/env bash
# Per-boot startup for the AthLink Cloud Agent environment.
# Brings up PostgreSQL and waits until it is ready to accept connections.
set -euo pipefail

PG_VERSION=16
PG_CLUSTER=main
PG_DATA="/var/lib/postgresql/${PG_VERSION}/${PG_CLUSTER}"

echo "==> Starting PostgreSQL"

if sudo -u postgres pg_isready -q 2>/dev/null; then
  echo "==> PostgreSQL is already running"
  exit 0
fi

# When booting from a snapshot/build the cluster was captured while running, so a
# stale postmaster.pid can remain and block startup. It is safe to remove here
# because pg_isready above already confirmed no live server is accepting connections.
if sudo test -f "${PG_DATA}/postmaster.pid"; then
  echo "==> Removing stale postmaster.pid"
  sudo rm -f "${PG_DATA}/postmaster.pid"
fi

sudo pg_ctlcluster "${PG_VERSION}" "${PG_CLUSTER}" start 2>/dev/null || true

for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q 2>/dev/null; then
    echo "==> PostgreSQL is ready"
    exit 0
  fi
  sleep 1
done

echo "!! PostgreSQL did not become ready in time" >&2
exit 1
