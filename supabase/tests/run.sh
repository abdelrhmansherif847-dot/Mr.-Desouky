#!/usr/bin/env bash
# Apply every migration to a fresh local database and run the security tests.
#   PGHOST=/path PGPORT=5432 supabase/tests/run.sh
# Needs PostgreSQL 16 client/server tools. Never touches the real project.
set -euo pipefail
cd "$(dirname "$0")/../.."
DB="mrd_test_$$"
psql -U "${PGUSER:-postgres}" -qc "create database $DB"
trap 'psql -U "${PGUSER:-postgres}" -qc "drop database if exists $DB" >/dev/null' EXIT
psql -U "${PGUSER:-postgres}" -d "$DB" -q -v ON_ERROR_STOP=1 -f supabase/tests/shim.sql
for f in supabase/migrations/*.sql; do
  psql -U "${PGUSER:-postgres}" -d "$DB" -q -v ON_ERROR_STOP=1 -f "$f"
done
out=$(psql -U "${PGUSER:-postgres}" -d "$DB" -q -f supabase/tests/rls.test.sql 2>&1 | grep -E '^(PASS|FAIL|[0-9]+ passed|ALL PASS|FAILURES)')
echo "$out"

# The sign-up gate, tested the way Supabase Auth meets it: a real connection
# logged in as supabase_auth_admin. Closed must refuse; open must create a
# pending student, whatever the metadata asks for.
gate_fail=0
insert_as_auth() {
  psql -U supabase_auth_admin -d "$DB" -qtAc \
    "insert into auth.users (email, raw_user_meta_data) values ('$1', '{\"intended_role\":\"owner\"}')" 2>&1
}
closed=$(insert_as_auth gate-closed@example.test || true)
if grep -q 'sign-ups are closed' <<<"$closed"; then echo "PASS  gate: closed refuses Supabase Auth"; else echo "FAIL  gate: closed refuses Supabase Auth — $closed"; gate_fail=1; fi
psql -U "${PGUSER:-postgres}" -d "$DB" -qc "update private.auth_settings set allow_signups = true"
opened=$(insert_as_auth gate-open@example.test || true)
role=$(psql -U "${PGUSER:-postgres}" -d "$DB" -qtAc "select p.role || '/' || p.status from public.profiles p join auth.users u on u.id = p.id where u.email = 'gate-open@example.test'")
if [ "$role" = "student/pending" ]; then echo "PASS  gate: open creates a pending student even when owner is requested"; else echo "FAIL  gate: open — $opened / $role"; gate_fail=1; fi
psql -U "${PGUSER:-postgres}" -d "$DB" -qc "update private.auth_settings set allow_signups = false"

grep -q '^ALL PASS$' <<<"$out" && [ "$gate_fail" = 0 ]
