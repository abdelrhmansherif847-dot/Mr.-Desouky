/**
 * AUTHENTICATION SEAM
 * ===================
 * There is deliberately NO authentication implemented in this codebase.
 *
 * The portals currently render sample data behind a clearly-labelled preview,
 * so there is nothing private to protect and no login that could give a false
 * impression of security. That is the honest state of things until a backend
 * exists.
 *
 * When the portals go live, this is where auth plugs in:
 *
 *  1. Add a provider — Auth.js (NextAuth), Supabase Auth, Clerk, or a custom
 *     session cookie. Whatever it is, sessions must be httpOnly, Secure and
 *     SameSite=Lax at minimum.
 *  2. Implement `getViewer()` below to read the real session.
 *  3. Add `src/app/(portal)/layout.tsx` guards — or better, a `middleware.ts`
 *     matching `/student/:path*` and `/parent/:path*` — that redirect
 *     unauthenticated visitors to the matching login page.
 *  4. Switch `IS_SAMPLE_DATA` off in `data.ts` and point the two record
 *     functions at the real store, scoped to the viewer's own id.
 *  5. A parent must only ever be able to read their own children's records —
 *     enforce that in the data layer, not in the UI.
 */

export type Viewer =
  | { kind: 'student'; id: string; name: string }
  | { kind: 'parent'; id: string; name: string }
  | null

/** Always returns null today. Real session lookup goes here. */
export async function getViewer(): Promise<Viewer> {
  return null
}

/** True once a real auth provider is wired up above. */
export const IS_AUTH_ENABLED = false
