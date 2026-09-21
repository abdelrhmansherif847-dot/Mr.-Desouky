'use client'

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from '@/components/ui/Button'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import { CONTACT, whatsappLink } from '@/content/site'
import { cn } from '@/lib/utils'
import type { Audience } from './audience'
import { AUDIENCE } from './audience'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * The sign-in card.
 *
 * Uses exactly the authentication the site already has — Supabase magic link,
 * the same call the owner's screen makes — rather than inventing a second
 * mechanism. There is no password anywhere in this project, so none is shown.
 *
 * Two behaviours are carried over deliberately and must not be "tidied":
 *
 *   shouldCreateUser: false — this form never creates an account. Sign-ups are
 *   closed in the database too; this simply avoids attempting one.
 *
 *   A 400 is reported as success — that is how an unknown address answers, and
 *   revealing it would turn this screen into a way to discover who has access.
 *   Anything else is shown verbatim, because a rate limit or an outage says
 *   nothing about any particular address.
 */
export function PortalSignInCard({
  audience,
  onAudienceChange,
}: {
  audience: Audience
  onAudienceChange: (next: Audience) => void
}) {
  const copy = AUDIENCE[audience]
  const fieldId = useId()
  const errorId = `${fieldId}-error`

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [notice, setNotice] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const invalid = status === 'error'

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!IS_SUPABASE_CONFIGURED || status === 'sending') return

    const address = email.trim()
    if (!address || !address.includes('@')) {
      setNotice('Enter the email address your account uses.')
      setStatus('error')
      inputRef.current?.focus()
      return
    }

    setNotice(null)
    setStatus('sending')

    // Loaded on submit, not on render. The auth library is ~260KB raw and is
    // useless until someone actually signs in, so keeping it out of the
    // initial payload leaves these public pages as light as the rest of the
    // site. The wait is hidden by the sending state that is already showing.
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const next = encodeURIComponent(copy.destination)
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        shouldCreateUser: false,
      },
    })

    if (!error || error.status === 400) {
      setStatus('sent')
      return
    }

    setNotice(
      error.status === 429
        ? `${error.message.replace(/[.\s]*$/, '')}. The sign-in sender allows only a few emails per hour.`
        : error.message,
    )
    setStatus('error')
  }

  return (
    <div className="relative overflow-hidden rounded-panel border border-white/12 bg-white/95 shadow-lift backdrop-blur-sm">
      {/* Learn to Progress, as a hairline. The card's one piece of colour. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 via-sky-500 to-growth-300"
      />
      <div className="p-6 sm:p-8">
        {status === 'sent' ? (
          <SentState audience={audience} email={email} onReset={() => setStatus('idle')} />
        ) : (
          <>
            <AudienceSwitch audience={audience} onChange={onAudienceChange} />

            <div className="mt-6">
              <p className="eyebrow text-sky-600">{copy.eyebrow}</p>
              <h2 className="mt-2 font-display text-xl font-bold text-deep-700">Sign in</h2>
              <p className="mt-2 text-sm leading-relaxed text-deep-500">{copy.cardLead}</p>
            </div>

            {!IS_SUPABASE_CONFIGURED ? (
              <p className="mt-6 rounded-card border border-alert-200 bg-alert-50/70 px-4 py-3 text-sm leading-relaxed text-alert-800">
                Sign-in is not configured for this deployment yet.
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-6">
                <label htmlFor={fieldId} className="block text-sm font-semibold text-deep-700">
                  Email address
                </label>

                {/* The focus line draws in from the start edge — the same
                  gesture as link-underline, so focus feels part of the brand
                  rather than a browser default. */}
                <div className="group relative mt-2">
                  <input
                    ref={inputRef}
                    id={fieldId}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    enterKeyHint="go"
                    required
                    value={email}
                    aria-invalid={invalid || undefined}
                    aria-describedby={invalid ? errorId : undefined}
                    disabled={status === 'sending'}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder="you@example.com"
                    className={cn(
                      'peer w-full rounded-card border bg-white px-4 py-3.5 text-[0.95rem] text-deep-700',
                      'outline-none transition-[border-color,box-shadow] duration-200 ease-smooth',
                      'placeholder:text-deep-300 disabled:cursor-not-allowed disabled:bg-deep-50',
                      invalid
                        ? 'border-alert-300 focus:border-alert-500 focus:ring-4 focus:ring-alert-100'
                        : 'border-deep-200 hover:border-deep-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100',
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none absolute inset-x-4 bottom-0 h-0.5 origin-left scale-x-0 rounded-full',
                      'transition-transform duration-300 ease-calm peer-focus:scale-x-100',
                      'motion-reduce:transition-none',
                      invalid ? 'bg-alert-500' : 'bg-sky-500',
                    )}
                  />
                </div>

                {invalid && notice ? (
                  <p
                    id={errorId}
                    role="alert"
                    className="mt-2.5 break-words text-sm text-alert-600"
                  >
                    {notice}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === 'sending'}
                  className="group mt-5 w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800"
                >
                  {status === 'sending' ? (
                    <>
                      <Spinner />
                      Sending your link…
                    </>
                  ) : (
                    <>
                      Email me a sign-in link
                      <ArrowRight />
                    </>
                  )}
                </Button>

                <p className="mt-4 text-xs leading-relaxed text-deep-400">
                  No password — a one-time link is sent to your inbox. It works once and expires.
                </p>
              </form>
            )}

            <Footnote audience={audience} />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Two portals, one control. Buttons with aria-pressed rather than a tablist:
 * these swap the whole page context and the URL, so the tab/panel contract
 * would be a promise the page does not keep.
 */
function AudienceSwitch({
  audience,
  onChange,
}: {
  audience: Audience
  onChange: (next: Audience) => void
}) {
  return (
    <div
      role="group"
      aria-label="Choose your portal"
      className="relative grid grid-cols-2 gap-1 rounded-full bg-deep-50 p-1"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-card transition-transform duration-300 ease-calm motion-reduce:transition-none"
        style={{ transform: audience === 'parent' ? 'translateX(calc(100% + 0.25rem))' : 'none' }}
      />
      {(['student', 'parent'] as const).map((value) => {
        const active = audience === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              'relative z-10 rounded-full px-4 py-2 font-display text-sm font-semibold',
              'transition-colors duration-200 ease-smooth',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
              active ? 'text-deep-700' : 'text-deep-500 hover:text-deep-700',
            )}
          >
            {AUDIENCE[value].switchLabel}
          </button>
        )
      })}
    </div>
  )
}

/** The moment it works. The mark draws itself rather than appearing. */
function SentState({
  audience,
  email,
  onReset,
}: {
  audience: Audience
  email: string
  onReset: () => void
}) {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-growth-50 ring-1 ring-inset ring-growth-200">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-growth-500" aria-hidden="true">
          <path
            d="M5 12.5 10 17.5 19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="32"
            className="animate-draw-check"
          />
        </svg>
      </span>

      <h2 className="mt-5 font-display text-xl font-bold text-deep-700">Check your inbox</h2>
      <p className="mt-2.5 text-sm leading-relaxed text-deep-500">
        If <span className="font-semibold text-deep-700">{email}</span> can sign in, a one-time link
        is on its way. Open it on this device — it works once and expires.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="link-underline mt-6 text-sm font-semibold text-sky-600"
      >
        Use a different address
      </button>

      <p className="mt-6 border-t border-deep-100 pt-5 text-xs leading-relaxed text-deep-400">
        Nothing arrived? Check spam, then message{' '}
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline font-semibold text-sky-600"
        >
          {CONTACT.whatsappDisplay}
        </a>
        .
      </p>
      <p className="sr-only" role="status">
        Sign-in link requested for {audience} portal.
      </p>
    </div>
  )
}

/** Honest about how accounts come to exist, without making it the headline. */
function Footnote({ audience }: { audience: Audience }) {
  const copy = AUDIENCE[audience]
  return (
    <div className="mt-7 border-t border-deep-100 pt-5">
      <p className="text-xs leading-relaxed text-deep-400">
        Accounts are issued by Eng. Abdelrhman Desouky. If you do not have one yet, message{' '}
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline font-semibold text-sky-600"
        >
          {CONTACT.whatsappDisplay}
        </a>
        .
      </p>
      <Link
        href={copy.previewHref}
        className="link-underline mt-3 inline-block py-1 text-xs font-semibold text-deep-500 hover:text-sky-600"
      >
        Explore the {audience} portal with sample data
      </Link>
    </div>
  )
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
