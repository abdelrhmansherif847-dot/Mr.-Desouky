import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * The guard. This runs on the server for every /admin request, before any
 * page renders, so it cannot be skipped by editing client JavaScript.
 *
 * It answers with 404, never 403 or a redirect to a login page: a stranger
 * probing /admin learns only that there is nothing there. Confirming the
 * area exists is itself a small leak, and the owner does not need the hint.
 *
 * IMPORTANT — this only executes on a host that runs Next.js middleware
 * (Vercel, or any Node server). On a static export it is compiled but never
 * runs, which is why the GitHub Pages workflow additionally refuses to
 * publish the admin routes at all. See docs/ADMIN.md.
 */

const notFound = (request: NextRequest) =>
  NextResponse.rewrite(new URL('/404', request.url), { status: 404 })

export async function middleware(request: NextRequest) {
  // The sign-in screen is the front door and is checked FIRST, before
  // anything else can refuse it. Ordering this after the configuration check
  // below was a real bug: on a deployment missing the Supabase variables the
  // login page answered 404, so there was no way to sign in and no way to see
  // why. It reveals nothing a configured deployment does not — it cannot
  // authenticate anyone, and it never discloses whether an address is known.
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next({ request })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Unconfigured means unprotected, so every other admin route is refused
  // rather than failing open.
  if (!url || !key) return notFound(request)

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Verifies the token with the auth server. Do not replace with getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return notFound(request)

  // Authenticated is not authorized: the role decides, and it lives in a
  // column no client-side key is permitted to write.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner') return notFound(request)

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
