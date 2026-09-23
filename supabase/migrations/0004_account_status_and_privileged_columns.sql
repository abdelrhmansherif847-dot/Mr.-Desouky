-- Phase 1 of the account system: an approval state, and the grants that make
-- it — and every other privileged column — unwritable by the people it governs.
--
-- Until now `authenticated` held UPDATE on the whole of public.profiles. RLS
-- kept that to a user's own row, and a trigger refused changes to `role`, but
-- the privilege itself covered every column: `email` could be rewritten freely,
-- and a new `status` column would have been self-approvable. Privileges are
-- narrowed here to the two columns a person may genuinely edit about
-- themselves, so the rest are refused before RLS or any trigger is consulted.

-- 1. Approval state.
create type public.account_status as enum ('pending', 'approved', 'suspended');

alter table public.profiles
  add column phone  text,
  add column status public.account_status not null default 'pending';

-- 2. ADD COLUMN ... DEFAULT backfills existing rows, which would put the owner
--    into 'pending'. Correct that in the same transaction so there is no
--    instant in which the owner is locked out.
update public.profiles set status = 'approved' where role = 'owner';

-- 3. Column-level UPDATE: full_name and phone only. role, status and email are
--    refused at the privilege layer for anon and authenticated.
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- 4. Defence in depth. The grant above already refuses these; the trigger
--    refuses them again, so a future careless GRANT cannot reopen the hole on
--    its own. SECURITY INVOKER, as before: it must see the real caller.
--    CREATE OR REPLACE keeps the existing trigger binding and ACL.
create or replace function private.enforce_role_immutable()
  returns trigger language plpgsql
  set search_path = public, pg_temp
as $$
begin
  if current_user in ('anon', 'authenticated') and (
       new.role   is distinct from old.role
    or new.status is distinct from old.status
    or new.email  is distinct from old.email
  ) then
    raise exception 'column is not user-modifiable';
  end if;
  return new;
end;
$$;
