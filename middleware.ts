import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * The guard. This runs on the server before any protected page renders, so it
 * cannot be skipped by editing client JavaScript. It protects two kinds of
 * area, deliberately differently:
 *
 *   /admin              Answers 404 to everyone but the owner — never 403 and
 *                       never a login redirect. A stranger probing /admin
 *                       learns only that there is nothing there.
 *
 *   /student, /parent   Advertised product surfaces, so a 404 would only
 *                       confuse. The anonymous are sent to that portal's
 *                       login; a signed-in account that is not allowed in is
 *                       sent where it belongs — the pending or suspended
 *                       notice, the other portal, or the owner to /admin.
 *
 * Authentication is not authorization. A portal needs all four: a session the
 * auth server verifies, a profile row, status 'approved', and the matching
 * role. `role` and `status` cannot be written by any signed-in user (migration
 * 0004), so what is read here is what the owner set.
 *
 * The public sample-data preview lives at /preview/* and is outside the
 * matcher on purpose: it holds nothing private and queries nothing.
 *
 * IMPORTANT — this only executes on a host that runs Next.js middleware
 * (Vercel, or any Node server). On a static export it is compiled but never
 * runs, which is why the GitHub Pages workflow refuses to publish the admin,
 * auth, portal and account routes at all. See docs/ADMIN.md.
 */

type Portal = 'student' | 'parent'

function portalOf(pathname: string): Portal | null {
  if (pathname === '/student' || pathname.startsWith('/student/')) return 'student'
  if (pathname === '/parent' || pathname.startsWith('/parent/')) return 'parent'
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The owner's sign-in screen is the front door and is checked FIRST, before
  // anything else can refuse it. Ordering this after the configuration check
  // below was a real bug once: with the Supabase variables missing, the login
  // page itself answered 404.
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next({ request })
  }

  const portal = portalOf(pathname)
  let response = NextResponse.next({ request })

  // A redirect is a new response, so it must carry any cookies Supabase
  // refreshed during this request — otherwise a signed-in account bounced to
  // /account/pending arrives with its refreshed session thrown away.
  const redirect = (path: string) => {
    const target = NextResponse.redirect(new URL(path, request.url))
    for (const cookie of response.cookies.getAll()) target.cookies.set(cookie)
    return target
  }
  const notFound = () => NextResponse.rewrite(new URL('/404', request.url), { status: 404 })
  const refuse = () => (portal ? redirect(`/login/${portal}`) : notFound())

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Unconfigured means unprotected, so every protected route is refused
  // rather than failing open.
  if (!url || !key) return refuse()

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
  if (!user) return refuse()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  // ---------- /admin: unchanged ----------
  if (!portal) return profile?.role === 'owner' ? response : notFound()

  // ---------- /student, /parent ----------
  if (!profile) return redirect(`/login/${portal}`)
  if (profile.status === 'suspended') return redirect('/account/suspended')
  if (profile.status !== 'approved') return redirect('/account/pending')
  if (profile.role === 'owner') return redirect('/admin')
  if (profile.role !== 'student' && profile.role !== 'parent') return redirect(`/login/${portal}`)
  if (profile.role !== portal) return redirect(`/${profile.role}`)

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/parent/:path*'],
}
