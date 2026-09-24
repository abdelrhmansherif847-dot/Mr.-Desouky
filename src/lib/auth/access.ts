/**
 * Who may enter a portal, and where everyone else is sent.
 *
 * Pure on purpose: no Supabase, no request. middleware.ts feeds it the
 * profile it read for a verified user, and the tests feed it every
 * combination, so the rule that decides access is the same rule that is
 * tested.
 *
 * Authentication is not authorization. A portal needs a profile row, status
 * 'approved', and the matching role. `role` and `status` are not writable by
 * any signed-in user (migrations 0004 and 0005), so what is read here is what
 * the owner set by hand.
 */

export type Portal = 'student' | 'parent'

export type AccessProfile = {
  role: string | null
  status: string | null
} | null

/** 'allow', or the path to send this account to instead. */
export function portalDecision(profile: AccessProfile, portal: Portal): 'allow' | string {
  if (!profile) return `/login/${portal}`
  if (profile.status === 'suspended') return '/account/suspended'
  if (profile.status !== 'approved') return '/account/pending'
  if (profile.role === 'owner') return '/admin'
  if (profile.role !== 'student' && profile.role !== 'parent') return `/login/${portal}`
  if (profile.role !== portal) return `/${profile.role}`
  return 'allow'
}
