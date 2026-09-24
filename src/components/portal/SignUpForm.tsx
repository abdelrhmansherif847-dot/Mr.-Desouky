'use client'

import { useId, useState } from 'react'
import { Button, ArrowRight } from '@/components/ui/Button'
import { callbackUrl } from '@/lib/auth/destinations'
import {
  LIMITS,
  looksLikeEmail,
  passwordProblem,
  phoneProblem,
  signUpOutcome,
} from '@/lib/auth/errors'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import { AUDIENCE, type Audience } from './audience'
import { AccountFormShell, Done, Field, FormError, NotConfigured, TextLink } from './AccountForm'

/**
 * Create an account.
 *
 * What this form sends is a request, not a grant. `intended_role` is only a
 * preference: the database (migration 0005) turns anything but the exact
 * string 'parent' into 'student', never creates owner or assistant, and
 * always writes status 'pending'. Nothing opens until the owner approves the
 * account and, for a parent, links it to a student. Whether sign-up is open
 * at all is decided in the database too (private.auth_settings), not here.
 *
 * Every successful submission shows the same "check your inbox" screen,
 * including for an address that already has an account, so the form cannot
 * be used to discover who is registered.
 */
export function SignUpForm({ audience }: { audience: Audience }) {
  const copy = AUDIENCE[audience]
  const id = useId()
  const errorId = `${id}-error`

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!IS_SUPABASE_CONFIGURED || sending) return

    const name = fullName.trim()
    const problem =
      (!name ? 'Enter your full name.' : null) ??
      (name.length > LIMITS.name ? `Keep your name under ${LIMITS.name} characters.` : null) ??
      phoneProblem(phone) ??
      (!looksLikeEmail(email) ? 'Enter a valid email address.' : null) ??
      passwordProblem(password, confirm)
    if (problem) return setError(problem)

    setError(null)
    setSending(true)

    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error: failure } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // The confirmation link comes back through the callback, then to this
        // portal's address, where middleware shows the pending notice.
        emailRedirectTo: callbackUrl(window.location.origin, copy.destination),
        data: {
          full_name: name,
          phone: phone.trim(),
          intended_role: audience,
        },
      },
    })

    setSending(false)
    const outcome = signUpOutcome(failure)
    if (!outcome.ok) return setError(outcome.message)
    setPassword('')
    setConfirm('')
    setDone(true)
  }

  const invalid = Boolean(error)

  return (
    <AccountFormShell
      eyebrow={copy.eyebrow}
      title={audience === 'parent' ? 'Create a parent account' : 'Create a student account'}
      lead={
        <>
          Every account is reviewed and approved by Eng. Abdelrhman Desouky before it opens
          {audience === 'parent' ? ', and linked to your student' : ''}.
        </>
      }
      footer={
        <>
          Already have an account? <TextLink href={`/login/${audience}`}>Sign in</TextLink>
        </>
      }
    >
      {!IS_SUPABASE_CONFIGURED ? (
        <NotConfigured />
      ) : done ? (
        <Done title="Check your inbox">
          If this address can be registered, a confirmation link is on its way. Open it on this
          device. Once confirmed, your account waits for approval — you will be able to sign in
          when it has been approved.
        </Done>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <Field
            id={`${id}-name`}
            label="Full name"
            name="name"
            autoComplete="name"
            maxLength={LIMITS.name}
            required
            value={fullName}
            disabled={sending}
            invalid={invalid}
            describedBy={errorId}
            onChange={(event) => setFullName(event.target.value)}
          />
          <Field
            id={`${id}-phone`}
            label="Phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={LIMITS.phone}
            required
            value={phone}
            disabled={sending}
            invalid={invalid}
            describedBy={errorId}
            hint="So Mr. Desouky can reach you. It is not used to sign in."
            onChange={(event) => setPhone(event.target.value)}
          />
          <Field
            id={`${id}-email`}
            label="Email address"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            disabled={sending}
            invalid={invalid}
            describedBy={errorId}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            id={`${id}-password`}
            label="Password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            disabled={sending}
            invalid={invalid}
            describedBy={errorId}
            hint={`At least ${LIMITS.passwordMin} characters.`}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Field
            id={`${id}-confirm`}
            label="Confirm password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            disabled={sending}
            invalid={invalid}
            describedBy={errorId}
            onChange={(event) => setConfirm(event.target.value)}
          />

          <FormError id={errorId} message={error} />

          <Button type="submit" size="lg" disabled={sending} className="mt-6 w-full">
            {sending ? 'Creating your account…' : 'Create account'}
            {sending ? null : <ArrowRight />}
          </Button>
        </form>
      )}
    </AccountFormShell>
  )
}
