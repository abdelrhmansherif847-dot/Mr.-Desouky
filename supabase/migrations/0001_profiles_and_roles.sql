-- Profiles and roles.
--
-- The role column is the single source of truth for who may reach /admin.
-- Everything below exists to make it impossible for a user to award that
-- role to themselves, even with a valid session and full knowledge of the
-- publishable key.

create type public.user_role as enum ('owner', 'assistant', 'student', 'parent');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text        not null,
  full_name  text,
  -- Anyone who signs up is a student until a human says otherwise. The owner
  -- row is promoted once, by hand, in the SQL editor.
  role       public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Read your own row. Nobody can enumerate other people's.
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

-- The owner can read every profile, for the admin tools.
-- Phrased against a non-recursive helper so the policy cannot re-enter itself.
create or replace function public.is_owner()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;

create policy "profiles: owner reads all"
  on public.profiles for select
  using (public.is_owner());

-- Update your own name only. `role` is deliberately excluded: the check
-- refuses any update that would change it, so a client cannot escalate.
create policy "profiles: update own name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- No insert or delete policy exists, so neither is permitted to the anon or
-- authenticated roles at all. Rows appear only through the trigger below.

-- Every new auth user gets a profile automatically, always as 'student'.
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Promoting the owner. Run ONCE, by hand, in the Supabase SQL editor, after
-- signing in for the first time so the row exists. Never from application
-- code -- an app that can grant 'owner' is an app that can be tricked into
-- granting it.
--
--   update public.profiles
--      set role = 'owner'
--    where email = 'your-address@example.com';
--
-- Verify, and expect exactly one row:
--
--   select email, role from public.profiles where role = 'owner';
-- ---------------------------------------------------------------------------
