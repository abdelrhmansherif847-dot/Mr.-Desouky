/**
 * Supabase connection values.
 *
 * The URL and the publishable (anon) key are public by design — they identify
 * the project and are meant to ship in the browser. They grant nothing on
 * their own: every table is protected by row-level security, so what a request
 * can read is decided by the database from the caller's verified session, not
 * by which key was used.
 *
 * The service-role key is the opposite and must never appear in this codebase.
 *
 * Both are optional at build time so the public static export still builds
 * with no Supabase project configured.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** True only when a project is actually configured for this build. */
export const IS_SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
