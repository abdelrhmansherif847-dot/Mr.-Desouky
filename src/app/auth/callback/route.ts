import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Where the magic link lands. Exchanges the one-time code for a session
 * cookie, then sends the visitor to /admin — where the middleware decides
 * whether they are actually allowed in. Arriving here proves only that
 * someone controls that mailbox, never that they are the owner.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(`${origin}/admin`)
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=link`)
}
