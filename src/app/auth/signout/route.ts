import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Sign out, for any signed-in account — the pending and suspended notices
 * use it. POST only, so a link or an image elsewhere cannot sign anyone out.
 * The owner's own sign-out stays at /admin/signout, which only the owner can
 * reach.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (supabase) await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.url), { status: 303 })
}
