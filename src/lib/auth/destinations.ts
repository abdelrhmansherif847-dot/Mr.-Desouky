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
