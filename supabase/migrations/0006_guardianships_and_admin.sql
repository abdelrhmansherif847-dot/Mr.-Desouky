-- 0006 — Parent ↔ student links, the owner's administrative functions, and
-- RLS on private.auth_settings.
--
-- SECURITY MODEL
--
-- Who may do what is decided here, in the database, and nowhere else. The
-- application checks too (middleware, server code), but those are
-- conveniences; a request that skips them still meets these rules.
--
--   * A guardianship (parent ↔ student link) can only be created or removed by
--     the owner, through the two functions below. No role has INSERT, UPDATE
--     or DELETE on the table, so a parent cannot link themselves to a student
--     and a student cannot choose a parent.
--   * An account's status and role can only be changed by the owner, through
--     public.admin_set_account. Migration 0004 already stops every signed-in
--     user from writing those columns directly; this does not loosen that.
--   * The functions are SECURITY DEFINER because they must write what no
--     client role may write. Each one sets an explicit search_path, is not
--     executable by PUBLIC or anon, and checks the caller is the owner before
--     touching anything. IDs are validated inside the function.
--
-- ROLLBACK
--   drop function public.linked_students();
--   drop function public.admin_unlink_guardian(uuid, uuid);
--   drop function public.admin_link_guardian(uuid, uuid);
--   drop function public.admin_set_account(uuid, public.account_status, public.user_role);
--   drop table public.guardianships;
--   drop function private.check_guardianship();
--   drop function private.caller_role();
--   alter table private.auth_settings disable row level security;

-- ---------------------------------------------------------------------------
-- 1. Defence in depth for the sign-up switch.
--
-- private is not an API schema and no client role has privileges on this
-- table, so it was never reachable. RLS with no policies makes that true a
-- second way. The sign-up gate still reads it: that function is owned by
-- postgres, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table private.auth_settings enable row level security;

-- ---------------------------------------------------------------------------
-- 2. The caller's role — but only while the account is approved.
--
-- Pending and suspended accounts get null, so every rule built on this treats
-- them as having no role at all. SECURITY INVOKER: it reads the caller's own
-- profile row, which the caller may already read.
-- ---------------------------------------------------------------------------
create or replace function private.caller_role()
  returns public.user_role
  language sql
  stable
  set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid() and status = 'approved'
$$;

revoke all on function private.caller_role() from public;
grant execute on function private.caller_role() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Guardianships.
-- ---------------------------------------------------------------------------
create table public.guardianships (
  parent_id  uuid        not null references public.profiles (id) on delete cascade,
  student_id uuid        not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid        references public.profiles (id) on delete set null,
  primary key (parent_id, student_id),
  constraint guardianships_distinct check (parent_id <> student_id)
);

-- The primary key serves "a parent's students"; this serves "a student's parents".
create index guardianships_student_id_idx on public.guardianships (student_id);

alter table public.guardianships enable row level security;

-- Read-only for signed-in users, and only their own links. Nobody gets write
-- privileges: links are made by the owner's functions below.
revoke all on public.guardianships from anon, authenticated;
grant select on public.guardianships to authenticated;

create policy "guardianships_select"
  on public.guardianships for select to authenticated
  using (
    (select private.is_owner())
    or (parent_id = (select auth.uid()) and (select private.caller_role()) = 'parent')
    or (student_id = (select auth.uid()) and (select private.caller_role()) = 'student')
  );

-- A link always joins a parent account to a student account, however it is
-- written — including from the SQL editor.
create or replace function private.check_guardianship()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from public.profiles where id = new.parent_id and role = 'parent') then
    raise exception 'guardian must be a parent account' using errcode = '23514';
  end if;
  if not exists (select 1 from public.profiles where id = new.student_id and role = 'student') then
    raise exception 'linked account must be a student account' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.check_guardianship() from public;

create trigger guardianships_check
  before insert or update on public.guardianships
  for each row execute function private.check_guardianship();

-- ---------------------------------------------------------------------------
-- 4. The owner's administrative functions.
-- ---------------------------------------------------------------------------

-- Approve, suspend, reinstate, or correct a role between student and parent.
create or replace function public.admin_set_account(
  target     uuid,
  new_status public.account_status,
  new_role   public.user_role default null
)
  returns void
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
declare
  current_role_value public.user_role;
begin
  if not private.is_owner() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if target is null or target = auth.uid() then
    raise exception 'this account cannot be changed here' using errcode = '22023';
  end if;

  select role into current_role_value from public.profiles where id = target for update;
  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;
  if current_role_value = 'owner' then
    raise exception 'owner accounts cannot be changed here' using errcode = '22023';
  end if;
  if new_role is not null and new_role not in ('student', 'parent') then
    raise exception 'role must be student or parent' using errcode = '22023';
  end if;
  -- A role change would leave existing links pointing at the wrong kind of
  -- account, so it is refused until they are removed.
  if new_role is not null and new_role <> current_role_value and exists (
    select 1 from public.guardianships where parent_id = target or student_id = target
  ) then
    raise exception 'remove this account''s links before changing its role' using errcode = '23514';
  end if;

  update public.profiles
     set status     = coalesce(new_status, status),
         role       = coalesce(new_role, role),
         updated_at = now()
   where id = target;
end;
$$;

revoke all on function public.admin_set_account(uuid, public.account_status, public.user_role) from public, anon;
grant execute on function public.admin_set_account(uuid, public.account_status, public.user_role) to authenticated;

create or replace function public.admin_link_guardian(parent uuid, student uuid)
  returns void
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  if not private.is_owner() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  -- Role checks happen in private.check_guardianship, on the insert itself.
  insert into public.guardianships (parent_id, student_id, created_by)
  values (parent, student, auth.uid())
  on conflict (parent_id, student_id) do nothing;
end;
$$;

revoke all on function public.admin_link_guardian(uuid, uuid) from public, anon;
grant execute on function public.admin_link_guardian(uuid, uuid) to authenticated;

create or replace function public.admin_unlink_guardian(parent uuid, student uuid)
  returns void
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  if not private.is_owner() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  delete from public.guardianships where parent_id = parent and student_id = student;
end;
$$;

revoke all on function public.admin_unlink_guardian(uuid, uuid) from public, anon;
grant execute on function public.admin_unlink_guardian(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. A parent's linked students — id and name only.
--
-- A parent needs their child's name to choose between children. A policy on
-- profiles would expose the whole row (email, phone), so this returns exactly
-- two columns, and only for an approved parent's own links.
-- ---------------------------------------------------------------------------
create or replace function public.linked_students()
  returns table (id uuid, full_name text)
  language sql
  stable
  security definer
  set search_path = public, pg_temp
as $$
  select p.id, p.full_name
    from public.guardianships g
    join public.profiles p on p.id = g.student_id
   where g.parent_id = auth.uid()
     and exists (
       select 1 from public.profiles me
        where me.id = auth.uid() and me.role = 'parent' and me.status = 'approved'
     )
   order by p.full_name nulls last, p.id
$$;

revoke all on function public.linked_students() from public, anon;
grant execute on function public.linked_students() to authenticated;
