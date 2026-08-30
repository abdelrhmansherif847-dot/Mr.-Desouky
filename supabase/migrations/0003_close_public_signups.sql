-- Public sign-ups are closed at the database, not only in a dashboard toggle.
-- GoTrue creates users as `supabase_auth_admin`, so refusing that role's
-- INSERTs stops account creation through every public path: the sign-in form,
-- the REST API, and the dashboard's "add user".
--
-- A `postgres` connection (the SQL editor) is unaffected, which is how the
-- owner account was created and how any future account would be. Verified: an
-- insert from that path still succeeds.
--
-- TO RE-OPEN SIGN-UPS LATER -- for the student and parent portals -- run:
--     update private.auth_settings set allow_signups = true;
-- No migration or deploy needed.

create table private.auth_settings (
  id            boolean primary key default true check (id),
  allow_signups boolean not null default false,
  updated_at    timestamptz not null default now()
);

insert into private.auth_settings default values;

revoke all on table private.auth_settings from public;

create or replace function private.enforce_signup_policy()
  returns trigger
  language plpgsql
  security definer
  set search_path = private, public, pg_temp
as $$
begin
  if current_user = 'supabase_auth_admin'
     and not (select allow_signups from private.auth_settings) then
    raise exception 'sign-ups are closed';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_signup_policy() from public;

create trigger enforce_signup_policy
  before insert on auth.users
  for each row execute function private.enforce_signup_policy();
