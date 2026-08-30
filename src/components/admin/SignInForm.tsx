'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'

/**
 * Requests a magic link. No password exists to phish, reuse or leak.
 *
 * The response is identical whatever the address — known, unknown, owner or
 * not. This screen deliberately cannot be used to enumerate accounts or to
 * discover who the owner is. Whether the resulting session may see anything
 * is decided later, by the database, not here.
 */
export function SignInForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [notice, setNotice] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!configured) return
    setState('sending')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Never create an account from this form. Sign-ups are closed in the
        // database too; this simply avoids attempting one.
        shouldCreateUser: false,
      },
    })

    // A 400 is reported as success on purpose: it is how an unknown address
    // answers, and revealing it would turn this screen into a way to discover
    // who can sign in.
    //
    // Everything else is shown verbatim. A rate limit or an outage says
    // nothing about any particular address -- it is global -- and hiding it
    // behind "could not be sent" cost real debugging time: the server was
    // answering 429 "email rate limit exceeded" while this screen implied
    // something was broken.
    if (!error || error.status === 400) {
      setState('sent')
      return
    }

    setNotice(
      error.status === 429
        ? `${error.message} Supabase's built-in sender allows only a few emails per hour.`
        : error.message,
    )
    setState('error')
  }

  return (
    <div className="rounded-panel border border-deep-100 bg-white p-7 shadow-card sm:p-8">
      <LogoMark size="md" />
      <h1 className="mt-6 font-display text-xl font-bold text-deep-700">Sign in</h1>

      {!configured ? (
        <p className="mt-3 text-sm leading-relaxed text-deep-500">
          No authentication project is configured for this deployment, so signing in is not
          possible here. See <span className="font-mono text-[0.8rem]">docs/ADMIN.md</span>.
        </p>
      ) : state === 'sent' ? (
        <p className="mt-3 text-sm leading-relaxed text-deep-500">
          If that address can sign in, a link is on its way. Open it on this device — it expires
          shortly and works once.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-deep-500">
            Enter your email and a one-time sign-in link will be sent to you. There is no password.
          </p>

          <form onSubmit={onSubmit} className="mt-6">
            <label htmlFor="email" className="block text-sm font-semibold text-deep-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-deep-200 px-3.5 py-2.5 text-sm text-deep-700 outline-none transition-colors duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />

            <Button type="submit" size="lg" className="mt-5 w-full" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Email me a link'}
            </Button>

            {state === 'error' && notice ? (
              <p className="mt-3 break-words text-sm text-alert-600">{notice}</p>
            ) : null}
          </form>
        </>
      )}
    </div>
  )
}
