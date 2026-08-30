-- Profiles and roles.
--
-- The `role` column is the sole authority on who may reach /admin. Everything
-- here exists to make it impossible for a signed-in user to grant themselves
-- that role, even holding a valid session and the publishable key.
--
-- Three independent layers, deliberately:
--   1. GRANTS   — decide which SQL operations a role may attempt at all.
--   2. RLS      — decides which rows those operations may touch.
--   3. TRIGGER  — refuses a role change from an API caller outright.

create type public.user_role as enum ('owner', 'assistant', 'student', 'parent');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text        not null,
  full_name  text,
  -- Anyone who signs up is a student. The owner is promoted once, by hand.
  role       public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Layer 1 — privileges. RLS filters rows; it does not gate operations, so
-- both are needed. anon gets nothing at all; authenticated may read and may
-- update (which the trigger below then constrains). Neither may INSERT or
-- DELETE, so rows can only ever appear through the trigger on auth.users.
revoke all on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;

-- SECURITY DEFINER so it reads profiles as the owner and cannot re-enter this
-- table's own policies. A plain function here would recurse.
create or replace function public.is_owner()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- Layer 2 — row-level security.
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_select_owner_all"
  on public.profiles for select to authenticated
  using (public.is_owner());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT and no DELETE policy exists, so neither is possible for any API
-- caller regardless of the grants above.

-- Layer 3 — role immutability.
--
-- NOT a policy with a subquery over profiles: that re-enters this table's own
-- RLS and can recurse. NOT security definer either, because the check depends
-- on knowing who is really calling — definer rights would report `postgres`
-- for everyone and the rule would never fire.
--
-- Via PostgREST current_user is `anon` or `authenticated`, so a role change is
-- refused. In the SQL editor it is `postgres`, and for a trusted backend it is
-- `service_role`; both are permitted, which is how the owner gets promoted.
create or replace function public.enforce_role_immutable()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated') then
    raise exception 'role is not user-modifiable';
  end if;
  return new;
end;
$$;

create trigger profiles_role_immutable
  before update on public.profiles
  for each row execute function public.enforce_role_immutable();

-- Every new auth user gets a profile, always as 'student'. SECURITY DEFINER so
-- it can insert despite there being no INSERT policy.
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Promoting the owner. Run ONCE, by hand, in the SQL editor, after signing in
-- for the first time so the row exists. Never from application code — an app
-- that can grant 'owner' is an app that can be tricked into granting it.
--
--   update public.profiles set role = 'owner' where email = 'you@example.com';
--   select email, role from public.profiles where role = 'owner';  -- expect 1
-- ---------------------------------------------------------------------------
