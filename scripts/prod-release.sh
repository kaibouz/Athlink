#!/usr/bin/env bash
# Release the current main branch to production (athlink-taupe.vercel.app).
#
#   bash scripts/prod-release.sh db      # create/update tables in the production DB (additive)
#   bash scripts/prod-release.sh seed    # load the public catalogue (coaches, athletes, feed) — safe to re-run
#   bash scripts/prod-release.sh merge   # merge PR #18 into main → Vercel deploys production
#   bash scripts/prod-release.sh check   # smoke-test the live site
#
# Production credentials are pulled from Vercel into a temp file and deleted on exit;
# nothing secret is printed.
set -euo pipefail
cd "$(dirname "$0")/.."

with_prod_env() {
  local tmp; tmp="$(mktemp)"
  trap 'rm -f "$tmp"' RETURN
  npx --yes vercel@latest env pull "$tmp" --environment=production --yes >/dev/null
  set -a; . "$tmp"; set +a
  "$@"
}

case "${1:-}" in
  db)
    with_prod_env bash -c '
      echo "tables before: $(psql "${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" -tA -c "select count(*) from information_schema.tables where table_schema='"'"'public'"'"'")"
      DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" node ./node_modules/drizzle-kit/bin.cjs push
      echo "tables after:  $(psql "${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" -tA -c "select count(*) from information_schema.tables where table_schema='"'"'public'"'"'")"'
    ;;
  seed)
    with_prod_env bash -c 'DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" npx tsx src/db/seed-public.ts'
    ;;
  merge)
    gh pr merge 18 --repo kaibouz/Athlink --merge
    ;;
  check)
    base="https://athlink-taupe.vercel.app"
    for p in / /search /c/c1 /sns /api/coaches; do
      printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$base$p")" "$p"
    done
    curl -s --max-time 30 "$base/" | grep -o "<title>[^<]*</title>" || true
    curl -s --max-time 30 "$base/api/coaches" | head -c 160; echo
    ;;
  *)
    sed -n '2,9p' "$0"; exit 1 ;;
esac
