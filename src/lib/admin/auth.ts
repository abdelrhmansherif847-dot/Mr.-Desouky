/**
 * OWNER / ADMIN ACCESS
 * ====================
 *
 * WHAT EXISTS TODAY
 * -----------------
 * No authentication. Not a stub, not a partial implementation — none. There
 * is no auth library in package.json, no user store, no session, no password
 * field anywhere in the codebase. `/login/student` and `/login/parent` are
 * honest "not open yet" screens that route people to WhatsApp.
 *
 * So there is no existing login for an owner role to attach to. This module
 * is the seam where one attaches, and the role model it will use.
 *
 * WHY NOTHING HERE CAN BE ENFORCED ON THE CURRENT HOST
 * ----------------------------------------------------
 * The site is `output: 'export'` served by GitHub Pages: static files, no
 * server, no request handler, no place to run a check an attacker cannot
 * skip. Any authorization written in this file would execute in the visitor's
 * own browser, on JavaScript they downloaded, which they can read and edit.
 *
 * That is why `getOwnerSession()` returns null unconditionally rather than
 * comparing an email in the browser. A client-side `email === OWNER` check
 * would be theatre: it would put the answer in the bundle and enforce nothing.
 *
 * The real protection in place today is different in kind: the admin routes
 * are not published to the public host at all. See the "Strip the internal
 * admin area" step in .github/workflows/deploy-pages.yml. A file that was
 * never deployed cannot be fetched, guessed, or bypassed — that is genuine,
 * unlike hiding a link.
 *
 * MINIMUM INFRASTRUCTURE FOR REAL AUTHORIZATION
 * ---------------------------------------------
 * Three things, none optional:
 *
 *   1. A host that runs server code — Vercel, Netlify, Cloudflare Pages with
 *      Functions, or any Node server. Drop `output: 'export'`. Without this,
 *      steps 2 and 3 cannot be enforced.
 *   2. An identity provider issuing verifiable sessions — Auth.js, Supabase
 *      Auth, Clerk. Sessions must be httpOnly, Secure, SameSite=Lax.
 *   3. `middleware.ts` matching `/admin/:path*`, calling `getOwnerSession()`
 *      below and returning 404 for anyone who is not the owner. 404 rather
 *      than 403 so the area's existence is not confirmed to strangers.
 *
 * docs/ADMIN.md carries the ready-to-paste middleware and the exact wiring.
 *
 * THE OWNER'S EMAIL
 * -----------------
 * `ADMIN_EMAIL` is read below with no NEXT_PUBLIC_ prefix. Next.js only
 * inlines NEXT_PUBLIC_ variables into the browser bundle, so this value
 * cannot reach client JavaScript even by mistake — and it is never committed.
 * Set it as a host environment variable when step 1 above is done.
 */

export type Role = 'student' | 'parent' | 'owner'

export type OwnerSession = {
  id: string
  name: string
  email: string
  role: 'owner'
}

/**
 * True only when a provider is actually verifying sessions server-side.
 * Everything that grants access must be gated on this, never on the presence
 * of a session object alone.
 */
export const IS_ADMIN_AUTH_ENABLED = false

/**
 * The one place an email is compared to the owner's. Server-only: reading a
 * non-NEXT_PUBLIC_ variable in a client component yields undefined, so this
 * cannot silently start working in the browser.
 */
export function isOwnerEmail(email: string | null | undefined): boolean {
  const owner = process.env.ADMIN_EMAIL
  if (!owner || !email) return false
  return email.trim().toLowerCase() === owner.trim().toLowerCase()
}

/**
 * Returns the signed-in owner, or null.
 *
 * Null today, always, on every host — because no provider exists to ask. When
 * one does, read the verified session here and return an OwnerSession only
 * when `isOwnerEmail()` agrees. Callers must treat null as "no access".
 */
export async function getOwnerSession(): Promise<OwnerSession | null> {
  if (!IS_ADMIN_AUTH_ENABLED) return null

  // ── Wire the provider in here, e.g. with Auth.js:
  //
  //   const session = await auth()
  //   if (!session?.user?.email || !isOwnerEmail(session.user.email)) return null
  //   return { id: session.user.id, name: session.user.name ?? 'Owner',
  //            email: session.user.email, role: 'owner' }
  //
  // Verify the session server-side. Never trust a value the client supplied.
  return null
}

/** Whether the data the admin tools display is real, private data. */
export const IS_ADMIN_DATA_PRIVATE = false
