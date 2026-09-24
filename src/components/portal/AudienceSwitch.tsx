'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Audience } from './audience'
import { AUDIENCE, AUDIENCES } from './audience'

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
export function AudienceSwitch({
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
export function AudienceIcon({ audience, className }: { audience: Audience; className?: string }) {
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
