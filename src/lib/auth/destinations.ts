/**
 * Where a sign-in link is allowed to send someone.
 *
 * `next` arrives from the URL, so it is attacker-controlled: anyone can send
 * a link carrying any value. An allowlist is the only check that cannot be
 * talked around by encoding tricks, protocol-relative URLs (`//evil.test`) or
 * path traversal — so the value is matched against this list exactly, never
 * parsed, normalised or merely prefix-checked.
 *
 * Landing on any of these grants nothing by itself: /admin is still guarded
 * by middleware, which re-verifies the session and the owner role.
 */
export const DESTINATIONS = ['/admin', '/student', '/parent'] as const

export type Destination = (typeof DESTINATIONS)[number]

/** The requested destination if it is one we serve, otherwise the default. */
export function resolveDestination(next: string | null | undefined): Destination {
  return DESTINATIONS.includes(next as Destination) ? (next as Destination) : '/admin'
}

/**
 * The address a sign-in link comes back to.
 *
 * `next` is always present — even for the owner's own default — because the
 * Supabase email template appends to this URL with an ampersand:
 *
 *   {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink
 *
 * A callback URL carrying no query string of its own would then produce
 * `/auth/callback&token_hash=…`, where the token becomes part of the path and
 * the link is simply broken. Building the URL here rather than in each form
 * means neither of them can forget, and the template's one assumption is
 * stated in the same place it is satisfied.
 *
 * The destination is typed, so only an allowlisted value can be put into a
 * link in the first place. resolveDestination still re-checks it on the way
 * back in, because by then it has been through an email and a URL.
 */
export function callbackUrl(origin: string, destination: Destination): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(destination)}`
}

/**
 * The kinds of emailed link the callback will redeem.
 *
 * The type now comes from the link, because one callback serves four emails:
 * sign-in, confirming a new account, resetting a password and confirming a
 * changed address. It is still matched against this list exactly, so a crafted
 * link cannot name anything else (invite, for instance, is not here: accounts
 * are never invited). Choosing a type grants nothing by itself: Supabase binds
 * every token to the type it was issued as, so a hash only redeems as what it
 * already is.
 *
 * A link with no type is a sign-in link, which is what every link was before
 * the others existed.
 */
export const LINK_TYPES = ['magiclink', 'signup', 'recovery', 'email_change'] as const

export type LinkType = (typeof LINK_TYPES)[number]

/** The link's type if it is one we redeem, 'magiclink' if absent, else null. */
export function parseLinkType(type: string | null | undefined): LinkType | null {
  if (type === null || type === undefined || type === '') return 'magiclink'
  return LINK_TYPES.includes(type as LinkType) ? (type as LinkType) : null
}

/** Where a password reset lands once its link has been redeemed. */
export const UPDATE_PASSWORD_PATH = '/account/update-password'

/**
 * Where to go once a link has produced a session.
 *
 * A password-reset link always goes to the page that sets the new password,
 * carrying the allowlisted destination to continue to afterwards. Everything
 * else goes straight to the allowlisted destination, where middleware then
 * decides what this account may see.
 *
 * The reset form's own redirect address also carries `recovery=1`. That
 * marker is honoured only for a PKCE code, which has no type of its own (a
 * reset link sent before the token_hash template, or while it is not in
 * place). A typed link is routed by its type alone, so the marker cannot
 * send a confirmation or sign-in link anywhere it would not otherwise go.
 */
export function afterVerify(type: LinkType | 'code', next: string | null, recovery: boolean): string {
  const destination = resolveDestination(next)
  if (type === 'recovery' || (type === 'code' && recovery)) {
    return `${UPDATE_PASSWORD_PATH}?next=${encodeURIComponent(destination)}`
  }
  return destination
}

/** The address a password-reset email comes back to. */
export function recoveryUrl(origin: string, destination: Destination): string {
  return `${callbackUrl(origin, destination)}&recovery=1`
}

/** The sign-in screen that goes with a destination, for "try again" links. */
export function loginFor(destination: Destination): string {
  return destination === '/admin' ? '/admin/login' : `/login${destination}`
}
