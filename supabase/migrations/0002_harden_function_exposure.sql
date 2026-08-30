-- PostgREST exposes every function in `public` as an RPC endpoint. None of
-- these three should be callable by anyone: two are trigger functions, and one
-- exists only to be referenced from an RLS policy. Moving them to a schema
-- that is not exposed removes the endpoints entirely, rather than relying on
-- grants alone to keep callers out.
--
-- Found by Supabase's own security advisor after 0001, not by inspection.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- Still SECURITY DEFINER, so it reads profiles without re-entering that
-- table's own RLS. `authenticated` keeps EXECUTE because RLS policy
-- expressions are evaluated as the querying role.
create or replace function private.is_owner()
  returns boolean language sql stable security definer
  set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  );
$$;

revoke all on function private.is_owner() from public;
grant execute on function private.is_owner() to authenticated;

drop policy "profiles_select_owner_all" on public.profiles;
create policy "profiles_select_owner_all"
  on public.profiles for select to authenticated
  using (private.is_owner());

drop function public.is_owner();

-- Trigger functions. The trigger mechanism does not check EXECUTE, so no role
-- needs the privilege for these to keep firing.
create or replace function private.handle_new_user()
  returns trigger language plpgsql security definer
  set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop function public.handle_new_user();

-- Deliberately SECURITY INVOKER: the check depends on knowing the real caller,
-- and definer rights would report `postgres` for everyone.
create or replace function private.enforce_role_immutable()
  returns trigger language plpgsql
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

revoke all on function private.enforce_role_immutable() from public;

drop trigger profiles_role_immutable on public.profiles;
create trigger profiles_role_immutable
  before update on public.profiles
  for each row execute function private.enforce_role_immutable();

drop function public.enforce_role_immutable();
