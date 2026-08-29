import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

/**
 * A Supabase client bound to the request's cookies, for use in Server
 * Components, Route Handlers and Server Actions.
 *
 * Returns null when no project is configured, so the public site still builds
 * and renders without one.
 */
export async function createClient() {
  // Also bail during a static export: reading cookies() there would opt the
  // whole tree into dynamic rendering and fail the build.
  if (!IS_SUPABASE_CONFIGURED || process.env.STATIC_EXPORT === 'true') return null

  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Components cannot set cookies. Middleware refreshes the
          // session on every request, so ignoring this is safe.
        }
      },
    },
  })
}
