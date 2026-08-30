import type { Metadata } from 'next'
import { CompleteSignIn } from '@/components/admin/CompleteSignIn'

export const metadata: Metadata = {
  title: 'Signing in',
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Where the magic link lands.
 *
 * This was a server Route Handler that read `?code=` and exchanged it. That
 * handles only one of the two shapes Supabase can return. When the link comes
 * back in the implicit form the tokens are in the URL *fragment*
 * (`#access_token=…`), which is never sent to a server — so the handler saw no
 * code, redirected to the login page, and sign-in looped forever.
 *
 * It is now a client page, which can see both the query string and the
 * fragment, and completes whichever one arrived.
 */
export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-5 py-16">
      <div className="w-full max-w-sm">
        <CompleteSignIn />
      </div>
    </main>
  )
}
