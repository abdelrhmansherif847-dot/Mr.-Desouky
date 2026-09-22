'use client'

import { useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from '@/components/ui/Button'
import { callbackUrl } from '@/lib/auth/destinations'
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import { CONTACT, whatsappLink } from '@/content/site'
import { cn } from '@/lib/utils'
import type { Audience } from './audience'
import { AUDIENCE, AUDIENCES } from './audience'
import { AudienceSwap } from './AudienceSwap'

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
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        emailRedirectTo: callbackUrl(window.location.origin, copy.destination),
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
    <div className="group/card relative">
      {/* A soft halo just outside the card, so it sits *in* the field rather
          than on top of it. Blurred and behind — it never touches the text. */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[2rem] bg-sky-400/[0.07] blur-2xl transition-colors duration-500 ease-calm group-focus-within/card:bg-sky-400/[0.14] motion-reduce:transition-none"
      />

      <div className="relative overflow-hidden rounded-panel bg-white/[0.97] shadow-[0_2px_4px_rgba(6,21,37,0.06),0_28px_60px_-20px_rgba(6,21,37,0.55)] ring-1 ring-inset ring-white/60 backdrop-blur-xl transition-shadow duration-500 ease-calm group-focus-within/card:shadow-[0_2px_4px_rgba(6,21,37,0.06),0_34px_70px_-20px_rgba(6,21,37,0.62)] motion-reduce:transition-none">
        {/* Learn to Progress, as a hairline. The card's one piece of colour. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 via-sky-500 to-growth-300"
        />
        {/* The inner highlight that makes a surface read as lit rather than
          filled — one hairline of white just below the top edge. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-[3px] h-px bg-gradient-to-r from-transparent via-white to-transparent"
        />
        <div className="p-6 sm:p-8">
          {status === 'sent' ? (
            <SentState audience={audience} email={email} onReset={() => setStatus('idle')} />
          ) : (
            <>
              <AudienceSwitch audience={audience} onChange={onAudienceChange} />

              {/* Only the words are handed over. The form below sits outside
                  this wrapper on purpose: it is never keyed and never
                  remounted, so whatever has been typed survives the switch. */}
              <AudienceSwap
                audience={audience}
                className="mt-6"
                render={(value) => (
                  <>
                    <p className="eyebrow text-sky-600">{AUDIENCE[value].eyebrow}</p>
                    <h2 className="mt-2 font-display text-xl font-bold text-deep-700">Sign in</h2>
                    <p className="mt-2 text-sm leading-relaxed text-deep-500">
                      {AUDIENCE[value].cardLead}
                    </p>
                  </>
                )}
              />

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
                    className={cn(
                      'group mt-5 w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800',
                      'hover:-translate-y-px hover:shadow-[0_10px_26px_-8px_rgba(15,121,172,0.7)]',
                      'motion-reduce:hover:translate-y-0',
                    )}
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
    </div>
  )
}

/**
 * Two portals, one control.
 *
 * Buttons with aria-pressed rather than a tablist: these swap the whole page
 * context and the URL, so the tab/panel contract would be a promise the page
 * does not keep. Arrow keys, Home and End still move between them, because a
 * segmented control is read as one thing and should behave like one.
 *
 * The motion is carried entirely by the indicator. It is the only element that
 * moves, it moves on the one curve in the system allowed to overshoot, and it
 * settles — which is what makes the control read as an object with mass being
 * slid across a track rather than two buttons restyling themselves. The labels
 * only change colour; the icons lift a little under the pointer and grow when
 * they take the pill.
 */
function AudienceSwitch({
  audience,
  onChange,
}: {
  audience: Audience
  onChange: (next: Audience) => void
}) {
  const buttons = useRef<Partial<Record<Audience, HTMLButtonElement | null>>>({})

  const move = (next: Audience) => {
    onChange(next)
    buttons.current[next]?.focus()
  }

  return (
    <div
      role="group"
      aria-label="Choose your portal"
      onKeyDown={(event) => {
        const next: Audience | null =
          event.key === 'ArrowRight' || event.key === 'End'
            ? 'parent'
            : event.key === 'ArrowLeft' || event.key === 'Home'
              ? 'student'
              : null
        if (!next) return
        event.preventDefault()
        move(next)
      }}
      className="relative grid grid-cols-2 gap-1 rounded-full bg-deep-50 p-1 ring-1 ring-inset ring-deep-100"
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white',
          'shadow-[0_1px_2px_rgba(18,59,93,0.10),0_6px_16px_-6px_rgba(18,59,93,0.34)]',
          'ring-1 ring-inset ring-white',
          'transition-transform duration-[420ms] ease-spring motion-reduce:transition-none',
        )}
        style={{ transform: audience === 'parent' ? 'translateX(calc(100% + 0.25rem))' : 'none' }}
      />
      {AUDIENCES.map((value) => {
        const active = audience === value
        return (
          <button
            key={value}
            ref={(node) => {
              buttons.current[value] = node
            }}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              'group relative z-10 flex items-center justify-center gap-2 rounded-full px-3 py-2.5',
              'font-display text-sm font-semibold',
              'transition-[color,transform] duration-200 ease-smooth',
              // The press is the touch equivalent of the hover response: there
              // is no pointer to lean toward on a phone, so the control gives
              // way under the finger instead.
              'active:scale-[0.97] active:duration-[120ms] motion-reduce:active:scale-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
              active ? 'text-deep-700' : 'text-deep-500 hover:text-deep-700',
            )}
          >
            {/* The unselected side warms slightly under the pointer, so the
                control answers before it is pressed. */}
            {active ? null : (
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-white/70 opacity-0 transition-opacity duration-200 ease-smooth group-hover:opacity-100 motion-reduce:transition-none"
              />
            )}
            <AudienceIcon
              audience={value}
              className={cn(
                'h-4 w-4 transition-[color,transform] duration-300 ease-calm motion-reduce:transition-none',
                active
                  ? 'scale-110 text-sky-500'
                  : 'text-deep-300 group-hover:-translate-y-px group-hover:text-deep-400',
              )}
            />
            {AUDIENCE[value].switchLabel}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Two marks drawn from the same geometric vocabulary as the rest of the site.
 *
 * Student — four ascending strokes: practice accumulating into progress.
 * Parent  — a point held within an arc: watching over, not intervening.
 *
 * Abstract on purpose. Illustrated characters would age the product and talk
 * down to the sixteen-year-olds who actually use it.
 */
function AudienceIcon({ audience, className }: { audience: Audience; className?: string }) {
  if (audience === 'student') {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
        <path
          d="M2.5 12.5v-2.2M6.5 12.5V7.6M10.5 12.5V4.9M14 12.5V2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 9.5a6 6 0 0 1 12 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.6" r="1.7" fill="currentColor" />
    </svg>
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
