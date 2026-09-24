import { staggerDelay } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { AUDIENCE, type Audience } from './audience'

/**
 * How an account comes to exist, as the four steps it actually takes.
 *
 * Shown beside the sign-up form, so what happens after "Create account" is
 * never a surprise, and on the pending notice, where it shows exactly which
 * step the account is on. It is the honest version of "sign up": registering
 * is a request, and access follows approval.
 *
 * `current` is the step in progress (0-based). Steps before it are done;
 * steps after it are still to come. Omit it to show the path with nothing
 * started.
 */
export function AccountPath({
  audience,
  current = -1,
  tone = 'dark',
  from = 4,
}: {
  /** Omitted where the audience is not known (the pending notice). */
  audience?: Audience
  current?: number
  tone?: 'dark' | 'light'
  /** Stagger index of the first step, to follow whatever sits above. */
  from?: number
}) {
  const steps = [
    { title: 'Create your account', body: 'Your name, a phone number, your email and a password.' },
    { title: 'Confirm your email', body: 'Open the link we send you, on the same device.' },
    {
      title: 'Approval',
      body: audience ? AUDIENCE[audience].approval : 'Mr. Desouky reviews every new account personally.',
    },
    {
      title: 'Your portal opens',
      body: audience ? AUDIENCE[audience].opens : 'Sign in and you go straight to your portal.',
    },
  ]
  const dark = tone === 'dark'

  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'next'
        const last = index === steps.length - 1
        return (
          <li
            key={step.title}
            className="relative flex gap-4 pb-6 last:pb-0 animate-fade-up"
            style={{ animationDelay: `${staggerDelay(from + index)}ms` }}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            {/* The rail. Filled green up to the current step: progress, drawn. */}
            {last ? null : (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-[0.9375rem] top-9 bottom-1 w-px',
                  state === 'done' ? 'bg-growth-400' : dark ? 'bg-white/15' : 'bg-deep-100',
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'relative flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center rounded-full font-mono text-[0.7rem] font-semibold ring-1 ring-inset',
                state === 'done' && 'bg-growth-500 text-white ring-growth-500',
                state === 'current' && (dark ? 'bg-sky-500/15 text-sky-200 ring-sky-400' : 'bg-sky-50 text-sky-700 ring-sky-400'),
                state === 'next' && (dark ? 'bg-white/5 text-deep-100/80 ring-white/20' : 'bg-white text-deep-500 ring-deep-200'),
              )}
            >
              {state === 'done' ? (
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                  <path d="M3.5 8.5 6.5 11.5 12.5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                `0${index + 1}`
              )}
              {state === 'current' ? (
                <span
                  data-ambient=""
                  className="absolute -inset-1 rounded-full ring-2 ring-sky-400/40 animate-ambient-breathe"
                />
              ) : null}
            </span>
            <div className="min-w-0 pt-1">
              <p className={cn('font-display text-sm font-semibold', dark ? 'text-white' : 'text-deep-700')}>
                {step.title}
                <span className="sr-only">
                  {state === 'done' ? ' — done' : state === 'current' ? ' — in progress' : ''}
                </span>
              </p>
              <p className={cn('mt-1 text-sm leading-relaxed', dark ? 'text-deep-100/75' : 'text-deep-500')}>
                {step.body}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
