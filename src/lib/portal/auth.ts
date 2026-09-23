import { createClient } from '@/lib/supabase/server'

/**
 * WHO IS LOOKING AT THE PORTAL
 * ============================
 * Authentication is not authorization. Four things must all be true before a
 * portal renders anything:
 *
 *   1. The session verifies with the auth server — getUser(), never
 *      getSession(), which only decodes a cookie the client can forge.
 *   2. A profile row exists for that user.
 *   3. The account is approved. A verified email alone grants nothing; new
 *      accounts wait in 'pending' until the owner approves them.
 *   4. The role is student or parent. The owner manages from /admin and has
 *      no portal of their own; any other role has no portal at all.
 *
 * middleware.ts enforces exactly this before a request reaches a page. This
 * function is the second, independent check the portal layouts make, so that
 * a misconfigured matcher — or a host that does not run middleware — still
 * cannot render a portal to someone who should not see it.
 *
 * `role` and `status` are not writable by any signed-in user: migration 0004
 * limits their UPDATE privilege to full_name and phone, and a trigger refuses
 * the rest again. So the values read here are ones only the owner can set.
 */

export type Viewer =
  | { kind: 'student'; id: string; name: string }
  | { kind: 'parent'; id: string; name: string }
  | null

export async function getViewer(): Promise<Viewer> {
  const supabase = await createClient()
  if (!supabase) return null

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'approved') return null
  if (profile.role !== 'student' && profile.role !== 'parent') return null

  return { kind: profile.role, id: user.id, name: profile.full_name?.trim() ?? '' }
}

/** A real provider is wired up: portals require a verified, approved account. */
export const IS_AUTH_ENABLED = true
