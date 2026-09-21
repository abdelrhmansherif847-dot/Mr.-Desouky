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
