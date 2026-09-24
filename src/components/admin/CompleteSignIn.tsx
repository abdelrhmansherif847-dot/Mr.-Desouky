'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { LogoMark } from '@/components/brand/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'

import { afterVerify, loginFor, parseLinkType, resolveDestination } from '@/lib/auth/destinations'

/**
 * Completes sign-in from whichever form the link came back in:
 *
 *   ?token_hash=&type=            The one the email actually sends. Redeemed
 *                                 with verifyOtp, as the allowlisted type:
 *                                 magiclink, signup, recovery or email_change.
 *   ?code=…                       PKCE. Exchanged for a session. Legacy —
 *                                 kept only for links already in an inbox.
 *   #access_token=&refresh_token= Implicit. Set directly. Never produced by
 *                                 this application.
 *
 * token_hash is what makes the link work at all. The previous flow was PKCE,
 * whose code verifier lives in the cookie jar of the browser that *asked* for
 * the link — and a magic link is opened in whatever browser the mail client
 * chooses, which on a phone is the mail app's own. The verifier was therefore
 * absent, exchangeCodeForSession threw before it ever reached the network, and
 * no session was created: auth.sessions had zero rows for the life of the
 * project. verifyOtp needs no verifier, so the link works from any browser on
 * any device.
 *
 * Nothing secret travels in the URL either way: the hash is redeemed over a
 * POST and the session comes back in the response body.
 *
 * Running in the browser is what makes handling all three possible — a
 * fragment is never sent to a server, so the original server-side handler
 * could only ever see a code and bounced the rest back to the login page,
 * looping forever. @supabase/ssr's browser client writes the same cookies the
 * server middleware reads, so the guard sees the session on the next request.
 *
 * On failure this shows the real reason. The page is only reached by following
 * a link from your own inbox, and a generic message here costs an hour of
 * guessing for no security gain — the sign-in form is where non-disclosure
 * matters, and that is unchanged.
 */
export function CompleteSignIn() {
  const [error, setError] = useState<string | null>(null)
  const shown = IS_SUPABASE_CONFIGURED
    ? error
    : 'This deployment has no Supabase project configured.'
  // The sign-in screen to go back to. Set from the link once in the browser,
  // so the server render and the first client render agree.
  const [retry, setRetry] = useState('/admin/login')

  useEffect(() => {
    if (!IS_SUPABASE_CONFIGURED) return
    let cancelled = false

    void (async () => {
      // Deferred so no state is set synchronously while the effect runs.
      await Promise.resolve()
      if (cancelled) return

      const params = new URLSearchParams(window.location.search)
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      setRetry(loginFor(resolveDestination(params.get('next'))))

      // Supabase reports its own failures this way — an expired or reused link.
      const denied = params.get('error_description') ?? hash.get('error_description')
      if (denied) return setError(denied)

      const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const tokenHash = params.get('token_hash')
      const code = params.get('code')
      const accessToken = hash.get('access_token')
      const refreshToken = hash.get('refresh_token')

      // Which email this link came from. Matched against an allowlist, never
      // passed through: see LINK_TYPES in lib/auth/destinations.
      const linkType = parseLinkType(params.get('type'))

      if (tokenHash) {
        if (!linkType) return setError('This link is not one this site issues.')
        const { data, error: failure } = await supabase.auth.verifyOtp({
          type: linkType,
          token_hash: tokenHash,
        })
        if (cancelled) return
        if (failure) return setError(failure.message)
        // A verified link that yields no session would mean the token was
        // accepted but redeemed into something other than a session. Naming it
        // separately keeps that from looking like a silent success. The one
        // exception is the first of the two links an address change sends,
        // which is confirmed without a new session being issued.
        if (!data.session && linkType !== 'email_change') {
          return setError('That link was accepted but no session was returned.')
        }
      } else if (code) {
        const { error: failure } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (failure) return setError(failure.message)
      } else if (accessToken && refreshToken) {
        const { error: failure } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (cancelled) return
        if (failure) return setError(failure.message)
      } else {
        return setError('This link carried no sign-in token. It may already have been used.')
      }

      // Where to land. `next` is attacker-controlled, so it is allowlisted —
      // see resolveDestination and afterVerify, both covered by tests/auth.
      // A password reset goes to the page that sets the new password first.
      const destination = afterVerify(
        tokenHash ? (linkType ?? 'magiclink') : 'code',
        params.get('next'),
        params.get('recovery') === '1',
      )

      // A full navigation, not a router push, so the request carries the
      // freshly written cookies and the middleware sees the session.
      window.location.replace(destination)
    })().catch((cause) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause))
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="rounded-panel border border-deep-100 bg-white p-7 shadow-card sm:p-8">
      <LogoMark size="md" />
      {shown === null ? (
        <>
          <h1 className="mt-6 font-display text-xl font-bold text-deep-700">Signing you in…</h1>
          <p className="mt-3 text-sm leading-relaxed text-deep-500">One moment.</p>
        </>
      ) : (
        <>
          <h1 className="mt-6 font-display text-xl font-bold text-deep-700">
            That link did not work
          </h1>
          <p className="mt-3 break-words text-sm leading-relaxed text-deep-500">{shown}</p>
          <p className="mt-3 text-sm leading-relaxed text-deep-400">
            Sign-in links work once and expire. Request a fresh one, and open it a single time.
          </p>
          <ButtonLink href={retry} size="lg" className="mt-6 w-full">
            Request a new link
          </ButtonLink>
        </>
      )}
    </div>
  )
}
