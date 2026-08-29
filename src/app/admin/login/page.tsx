import type { Metadata } from 'next'
import { SignInForm } from '@/components/admin/SignInForm'
import { IS_SUPABASE_CONFIGURED } from '@/lib/supabase/env'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false, nocache: true },
}

/**
 * The owner's way in. Reachable only by typing the address — it is in no
 * navigation, no sitemap, and no search index.
 *
 * The screen is intentionally uninformative. It never says whether an address
 * is known, whether it is the owner's, or that an admin area exists at all:
 * every submission gets the same "check your email" answer. That keeps it
 * useless for discovering who has access.
 */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-5 py-16">
      <div className="w-full max-w-sm">
        <SignInForm configured={IS_SUPABASE_CONFIGURED} />
      </div>
    </main>
  )
}
