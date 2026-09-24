-- Self-registration: what a new account may be, and whether it may exist.
--
-- A. What a new account may be.
--
-- Everything in raw_user_meta_data is supplied by the client at sign-up, so
-- none of it is trusted for authorisation. `intended_role` may only choose
-- between the two self-service portals: the exact string 'parent' gives a
-- parent profile, and anything else -- 'owner', 'assistant', missing, a
-- different case, stray whitespace, any other string -- gives a student.
-- Owner and assistant are never reachable from here; they are set by hand in
-- the SQL editor (docs/ADMIN.md).
--
-- Status is always 'pending', written explicitly rather than left to the
-- column default, and no metadata key is read for it. Access follows only
-- when the owner approves the account.
--
-- The phone number goes to public.profiles.phone. auth.users.phone is never
-- written: it is Supabase's own login identifier, and this number is contact
-- information, not a credential.
--
-- Name and phone are trimmed, blank becomes null, and both are capped so the
-- client cannot store arbitrarily large values in a profile.
--
-- B. Whether it may exist -- a fix to 0003.
--
-- 0003's gate compared current_user with supabase_auth_admin. Inside a
-- SECURITY DEFINER function current_user is the function's owner (postgres),
-- so the comparison was never true and the gate never fired: sign-ups were
-- closed only by the dashboard setting, not by the database as intended.
-- session_user is the role the connection logged in as and is not changed by
-- definer rights, so it identifies Supabase Auth correctly. The function stays
-- SECURITY DEFINER because it must read private.auth_settings, which
-- supabase_auth_admin has no privileges on.

create or replace function private.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role, status)
  values (
    new.id,
    new.email,
    left(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), 120),
    left(nullif(btrim(new.raw_user_meta_data ->> 'phone'), ''), 32),
    case
      when new.raw_user_meta_data ->> 'intended_role' = 'parent'
        then 'parent'::public.user_role
      else 'student'::public.user_role
    end,
    'pending'::public.account_status
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create or replace function private.enforce_signup_policy()
  returns trigger
  language plpgsql
  security definer
  set search_path = private, public, pg_temp
as $$
begin
  -- session_user, not current_user: see B above.
  if session_user = 'supabase_auth_admin'
     and not (select allow_signups from private.auth_settings) then
    raise exception 'sign-ups are closed';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_signup_policy() from public;
