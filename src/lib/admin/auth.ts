/**
 * ADMIN ACCESS
 * ============
 * The admin area is internal: operational tools for running the teaching
 * practice, deliberately kept out of the public site and its navigation.
 *
 * ⚠️  READ THIS BEFORE PUTTING REAL DATA HERE
 *
 * There is no authentication implemented, and on the current hosting there
 * cannot be. The site is a static export served by GitHub Pages: every page
 * and every byte of data in the bundle is downloadable by anyone who knows
 * the URL. A login screen on a static site is decoration — it hides nothing.
 *
 * So this area is *private by intent*, not by enforcement:
 *   · not linked from any public navigation
 *   · `noindex, nofollow` on every admin page
 *   · disallowed in robots.txt
 *
 * That keeps it out of search results and out of visitors' way. It does not
 * make it secret.
 *
 * To make it genuinely private, both of these are needed:
 *
 *   1. A server. Move off static export to a Node host (Vercel and similar),
 *      then add a real provider — Auth.js, Supabase Auth, Clerk — and guard
 *      `/admin/:path*` in middleware. `getAdminViewer()` below is where that
 *      lookup goes.
 *
 *   2. The data behind that server. Anything committed to this repository is
 *      public while the repository is public, regardless of any login. Real
 *      student records belong in a database read through an authenticated
 *      API, not in `src/content`.
 *
 * See docs/ADMIN.md.
 */

export type AdminViewer = { id: string; name: string; role: 'owner' | 'assistant' } | null

/** Always null today. Real session lookup goes here. */
export async function getAdminViewer(): Promise<AdminViewer> {
  return null
}

/** True once a real provider guards this area. */
export const IS_ADMIN_AUTH_ENABLED = false

/**
 * Whether the data shown is real. While false, the admin tools render the
 * timetable committed to the repository, which is not private — see above.
 */
export const IS_ADMIN_DATA_PRIVATE = false
