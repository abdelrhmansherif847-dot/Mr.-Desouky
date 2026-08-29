import { createClient } from '@/lib/supabase/server'
import { IS_SUPABASE_CONFIGURED } from '@/lib/supabase/env'

/**
 * OWNER / ADMIN AUTHORIZATION
 * ===========================
 * Real, server-side, and enforced by the database — not by this UI.
 *
 * Two independent checks have to pass before anything admin is reachable:
 *
 *   1. Authentication. `supabase.auth.getUser()` asks the Supabase auth server
 *      to VERIFY the token on every call. It is used deliberately in place of
 *      `getSession()`, which only decodes the cookie and therefore trusts data
 *      the client can forge. Never swap it back.
 *
 *   2. Authorization. The verified user id is looked up in `public.profiles`
 *      and must carry role = 'owner'. That column is not writable by any user:
 *      the RLS policies in supabase/migrations grant SELECT on your own row
 *      and no UPDATE of `role` to anyone holding the anon or authenticated
 *      key. Only a service-role connection (never present in this codebase)
 *      or the SQL editor can change it.
 *
 * Signing in is therefore not the same as getting in. Anyone can request a
 * magic link for their own address and receive a valid session — they will
 * still have no profile row with role 'owner', so `/admin` stays a 404 for
 * them. Access is a property of the database row, not of having logged in.
 */

export type Role = 'owner' | 'assistant' | 'student' | 'parent'

export type OwnerSession = {
  id: string
  email: string
  name: string
  role: 'owner'
}

/** True when this build can enforce authorization: a project is configured. */
export const IS_ADMIN_AUTH_ENABLED = IS_SUPABASE_CONFIGURED

/**
 * The signed-in owner, or null for absolutely everyone else — anonymous
 * visitors, students, parents, and any authenticated user whose profile is
 * not `owner`. Callers must treat null as "no access" and reveal nothing.
 */
export async function getOwnerSession(): Promise<OwnerSession | null> {
  const supabase = await createClient()
  if (!supabase) return null

  // Verified against the auth server, not merely decoded from the cookie.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'owner') return null

  return {
    id: user.id,
    email: user.email ?? '',
    name: profile.full_name?.trim() || user.email?.split('@')[0] || 'Owner',
    role: 'owner',
  }
}

/**
 * Whether the data the admin tools display is real, private data. Still false:
 * the schedule rendered today is the anonymised file in src/content. Real
 * records move into Postgres behind RLS before this becomes true.
 */
export const IS_ADMIN_DATA_PRIVATE = false
