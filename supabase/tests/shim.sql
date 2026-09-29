-- A local stand-in for the parts of Supabase the migrations depend on, so
-- they can be applied and their RLS tested against a plain PostgreSQL 16.
-- Never applied to the real project.

-- Roles are cluster-wide, so they are created once and reused.
-- Supabase Auth connects as supabase_auth_admin; it is a login role here so
-- the sign-up gate (session_user = 'supabase_auth_admin') can be tested for real.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin login noinherit;
  end if;
end $$;

grant usage on schema public to anon, authenticated, service_role;

-- Supabase grants everything on new public tables to the API roles by
-- default. Reproduced so migrations are tested against the same defaults
-- they meet in production (and must revoke explicitly).
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role, supabase_auth_admin;

create table auth.users (
  id                 uuid primary key default gen_random_uuid(),
  instance_id        uuid,
  aud                text,
  role               text,
  email              text unique,
  phone              text,
  raw_user_meta_data jsonb default '{}'::jsonb,
  raw_app_meta_data  jsonb default '{}'::jsonb,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
grant all on auth.users to supabase_auth_admin;

create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
$$;
grant execute on function auth.uid() to anon, authenticated, service_role, supabase_auth_admin;
