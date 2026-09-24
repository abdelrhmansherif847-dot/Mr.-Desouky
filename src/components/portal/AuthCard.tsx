'use client'

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Button, ArrowRight } from '@/components/ui/Button'
import { CONTACT, whatsappLink } from '@/content/site'
import { cn } from '@/lib/utils'

/**
 * The pieces every account form is built from. They began inside the sign-in
 * card and were lifted out unchanged, so sign-up, reset and the notices are
 * the same object as sign-in rather than a family resemblance.
 */

/** The lifted glass card with its halo and the Learn-to-Progress hairline. */
export function AuthCard({ children }: { children: ReactNode }) {
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
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  )
}

/** Eyebrow, title and one line — the head of every card. */
export function CardHeading({
  eyebrow,
  title,
  lead,
  as: Heading = 'h2',
}: {
  eyebrow?: string
  title: string
  lead?: ReactNode
  as?: 'h1' | 'h2'
}) {
  return (
    <>
      {eyebrow ? <p className="eyebrow text-sky-700">{eyebrow}</p> : null}
      <Heading className={cn('font-display text-xl font-bold text-deep-700', eyebrow && 'mt-2')}>
        {title}
      </Heading>
      {lead ? <p className="mt-2 text-sm leading-relaxed text-deep-500">{lead}</p> : null}
    </>
  )
}

const inputClass = (invalid?: boolean) =>
  cn(
    'peer w-full rounded-card border bg-white px-4 py-3.5 text-[0.95rem] text-deep-700',
    'outline-none transition-[border-color,box-shadow] duration-200 ease-smooth',
    'placeholder:text-deep-400 disabled:cursor-not-allowed disabled:bg-deep-50',
    invalid
      ? 'border-alert-300 focus:border-alert-500 focus:ring-4 focus:ring-alert-100'
      : 'border-deep-200 hover:border-deep-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100',
  )

/**
 * The focus line draws in from the start edge — the same gesture as
 * link-underline, so focus feels part of the brand rather than a browser
 * default.
 */
function FocusLine({ invalid }: { invalid?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-4 bottom-0 h-0.5 origin-left scale-x-0 rounded-full',
        'transition-transform duration-300 ease-calm peer-focus:scale-x-100',
        'motion-reduce:transition-none',
        invalid ? 'bg-alert-500' : 'bg-sky-500',
      )}
    />
  )
}

type FieldProps = {
  id: string
  label: string
  invalid?: boolean
  /** The id of the form's error line, announced with the field when invalid. */
  errorId?: string
  hint?: ReactNode
  /** Rendered on the label's line, at the far end (e.g. "Forgot password?"). */
  aside?: ReactNode
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'>

export const AuthField = forwardRef<HTMLInputElement, FieldProps>(function AuthField(
  { id, label, invalid, errorId, hint, aside, className, ...input },
  ref,
) {
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-semibold text-deep-700">
          {label}
        </label>
        {aside}
      </div>
      <div className="group relative mt-2">
        <input
          ref={ref}
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={[hintId, invalid ? errorId : undefined].filter(Boolean).join(' ') || undefined}
          className={inputClass(invalid)}
          {...input}
        />
        <FocusLine invalid={invalid} />
      </div>
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-deep-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

/**
 * A password field that can be revealed. The toggle is a real button with a
 * pressed state, reachable by keyboard, and it never submits the form. The
 * value is untouched by showing or hiding it.
 */
export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, 'type'>>(
  function PasswordField({ id, label, invalid, errorId, hint, aside, className, ...input }, ref) {
    const [shown, setShown] = useState(false)
    const hintId = hint ? `${id}-hint` : undefined
    return (
      <div className={className}>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={id} className="block text-sm font-semibold text-deep-700">
            {label}
          </label>
          {aside}
        </div>
        <div className="group relative mt-2">
          <input
            ref={ref}
            id={id}
            type={shown ? 'text' : 'password'}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={invalid || undefined}
            aria-describedby={[hintId, invalid ? errorId : undefined].filter(Boolean).join(' ') || undefined}
            className={cn(inputClass(invalid), 'pr-[4.75rem]')}
            {...input}
          />
          <button
            type="button"
            aria-pressed={shown}
            aria-controls={id}
            aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            disabled={input.disabled}
            onClick={() => setShown((value) => !value)}
            className={cn(
              'absolute inset-y-1.5 right-1.5 rounded-[0.7rem] px-3 text-xs font-semibold text-deep-600',
              'transition-colors duration-200 ease-smooth hover:bg-deep-50 hover:text-deep-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {shown ? 'Hide' : 'Show'}
          </button>
          <FocusLine invalid={invalid} />
        </div>
        {hint ? (
          <div id={hintId} className="mt-1.5 text-xs leading-relaxed text-deep-500">
            {hint}
          </div>
        ) : null}
      </div>
    )
  },
)

/** A live checklist for a new password. Informative only; the submit checks again. */
export function PasswordRules({ password, confirm, min }: { password: string; confirm: string; min: number }) {
  const rules = [
    { met: password.length >= min, label: `At least ${min} characters` },
    { met: password.length > 0 && password === confirm, label: 'Both passwords match' },
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={cn(
            'flex items-center gap-1.5 transition-colors duration-200 ease-smooth',
            rule.met ? 'text-growth-700' : 'text-deep-500',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex h-3.5 w-3.5 items-center justify-center rounded-full ring-1 ring-inset transition-colors duration-200 ease-smooth',
              rule.met ? 'bg-growth-500 ring-growth-500' : 'bg-white ring-deep-300',
            )}
          >
            {rule.met ? (
              <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 text-white">
                <path d="M3.5 8.5 6.5 11.5 12.5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </span>
          {rule.label}
          <span className="sr-only">{rule.met ? '(done)' : '(not yet)'}</span>
        </li>
      ))}
    </ul>
  )
}

/** The form's single error line. */
export function AuthAlert({ id, message }: { id: string; message: string | null }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-3 break-words text-sm text-alert-600">
      {message}
    </p>
  )
}

/** The primary action: sky, lifts slightly on hover, a spinner while busy. */
export function AuthSubmit({
  busy,
  busyLabel,
  children,
}: {
  busy: boolean
  busyLabel: string
  children: ReactNode
}) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={busy}
      className={cn(
        'group mt-6 w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800',
        'hover:-translate-y-px hover:shadow-[0_10px_26px_-8px_rgba(15,121,172,0.7)]',
        'motion-reduce:hover:translate-y-0',
      )}
    >
      {busy ? (
        <>
          <Spinner />
          {busyLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRight />
        </>
      )}
    </Button>
  )
}

/** The moment it works. The mark draws itself rather than appearing. */
export function AuthSuccess({
  title,
  children,
  tone = 'growth',
}: {
  title: string
  children: ReactNode
  tone?: 'growth' | 'sky'
}) {
  return (
    <div className="text-center" role="status">
      <span
        className={cn(
          'mx-auto flex h-14 w-14 items-center justify-center rounded-full ring-1 ring-inset',
          tone === 'growth' ? 'bg-growth-50 ring-growth-200' : 'bg-sky-50 ring-sky-200',
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn('h-7 w-7', tone === 'growth' ? 'text-growth-500' : 'text-sky-500')}
          aria-hidden="true"
        >
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
      <h2 className="mt-5 font-display text-xl font-bold text-deep-700">{title}</h2>
      <div className="mt-2.5 text-sm leading-relaxed text-deep-600">{children}</div>
    </div>
  )
}

/** "Nothing arrived?" — the same way out on every screen. */
export function ContactLine({ lead = 'Need a hand? Message' }: { lead?: string }) {
  return (
    <>
      {lead}{' '}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="link-underline font-semibold text-sky-700"
      >
        {CONTACT.whatsappDisplay}
      </a>
      .
    </>
  )
}

/** The divider-topped footnote at the foot of a card. */
export function CardFoot({ children }: { children: ReactNode }) {
  return (
    <div className="mt-7 border-t border-deep-100 pt-5 text-xs leading-relaxed text-deep-500">
      {children}
    </div>
  )
}

export function NotConfigured({ what = 'Sign-in' }: { what?: string }) {
  return (
    <p className="mt-6 rounded-card border border-alert-200 bg-alert-50/70 px-4 py-3 text-sm leading-relaxed text-alert-800">
      {what} is not configured for this deployment yet.
    </p>
  )
}

export function Spinner() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}
