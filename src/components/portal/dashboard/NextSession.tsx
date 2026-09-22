'use client'

import { useEffect, useState } from 'react'
import { MathTexture } from '@/components/brand/MathTexture'
import { staggerDelay } from '@/lib/motion'
import { cn } from '@/lib/utils'
import {
  VIEWER_GROUP_ID,
  WEEK_SLOTS,
  dayById,
  formatCountdown,
  formatDuration,
  formatRange,
  groupOf,
  isMine,
  nextSessionFor,
  type UpcomingSlot,
} from '@/content/week'

/**
 * "What do I have next" — the one element on this page allowed real weight.
 *
 * The student's whole week is rendered on the server, so the card is complete
 * and readable before any JavaScript runs and with none at all. Only the part
 * that genuinely depends on the current moment — which session is next, and
 * how long until it starts — is filled in after mount. That keeps the server
 * and client markup identical (no hydration mismatch), costs no layout shift
 * because the row heights never change, and means the page is useful to a
 * visitor whose JavaScript failed.
 *
 * The clock is read once a minute. A countdown that reads "in 3 hours" does
 * not need to be recomputed more often than the text can change.
 */
export function NextSession({ viewerGroupId = VIEWER_GROUP_ID }: { viewerGroupId?: string }) {
  const mine = WEEK_SLOTS.filter((slot) => isMine(slot, viewerGroupId))
  const [upcoming, setUpcoming] = useState<UpcomingSlot | null>(null)

  useEffect(() => {
    const read = () => setUpcoming(nextSessionFor(new Date(), viewerGroupId))
    read()
    const timer = window.setInterval(read, 60_000)
    return () => window.clearInterval(timer)
  }, [viewerGroupId])

  return (
    <section
      aria-labelledby="next-session-heading"
      className="relative isolate overflow-hidden rounded-panel bg-deep-800"
    >
      {/* The field. Same vocabulary as the sign-in screen, quieter. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_8%_0%,#154063_0%,#0E2F4A_50%,#0A2137_100%)]" />
        <div className="absolute inset-0 texture-grid-dark opacity-[0.35] mask-fade-b" />
        <div className="absolute -right-[12%] -top-[30%] h-[30rem] w-[30rem] rounded-full bg-sky-500/[0.12] blur-[110px]" />
        <div className="absolute inset-x-0 bottom-0 h-24 opacity-40">
          <MathTexture tone="dark" density="sparse" ambient />
        </div>
      </div>

      <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        {/* ---------- The headline ---------- */}
        <div>
          <p className="eyebrow flex items-center gap-2.5 text-sky-300">
            <span
              aria-hidden="true"
              data-ambient=""
              className={cn(
                'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                upcoming?.live ? 'bg-growth-300 animate-ambient-breathe' : 'bg-sky-400',
              )}
            />
            {upcoming?.live ? 'In session' : 'Your next session'}
          </p>

          <h2
            id="next-session-heading"
            className="mt-3.5 font-display text-2xl font-bold leading-tight text-white sm:text-3xl"
          >
            {upcoming ? (
              <>
                {upcoming.day.label}
                <span className="block text-sky-200">
                  {formatRange(upcoming.slot.start, upcoming.slot.end)}
                </span>
              </>
            ) : (
              <>
                Your week
                <span className="block text-sky-200">with Mr. Desouky</span>
              </>
            )}
          </h2>

          {/* Reserved height, so filling this in after mount moves nothing. */}
          <p className="mt-3 min-h-[1.5rem] text-sm text-deep-100/75">
            {upcoming ? (
              <span className="animate-fade-in">
                {formatDuration(upcoming.slot.start, upcoming.slot.end)} ·{' '}
                {groupOf(upcoming.slot)?.label}
              </span>
            ) : null}
          </p>

          <p className="mt-5 min-h-[2.5rem]">
            {upcoming ? (
              <span
                className={cn(
                  'inline-flex animate-fade-in items-center gap-2 rounded-full px-4 py-2',
                  'font-display text-sm font-semibold ring-1 ring-inset',
                  upcoming.live
                    ? 'bg-growth-400/15 text-growth-200 ring-growth-300/30'
                    : 'bg-white/8 text-white ring-white/20',
                )}
              >
                {formatCountdown(upcoming)}
              </span>
            ) : null}
          </p>
        </div>

        {/* ---------- The week, always present ---------- */}
        <div className="lg:border-l lg:border-white/10 lg:pl-10">
          <p className="eyebrow text-deep-100/50">This week</p>
          <ul className="mt-3.5 space-y-1.5">
            {mine.map((slot, index) => {
              const isNext = upcoming?.slot.id === slot.id
              return (
                <li
                  key={slot.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${staggerDelay(index + 1)}ms` }}
                >
                  <div
                    className={cn(
                      'flex items-baseline justify-between gap-4 rounded-card px-3.5 py-2.5',
                      'transition-colors duration-300 ease-calm motion-reduce:transition-none',
                      isNext ? 'bg-white/10 ring-1 ring-inset ring-sky-300/30' : 'bg-white/[0.04]',
                    )}
                  >
                    <span
                      className={cn(
                        'font-display text-sm font-semibold',
                        isNext ? 'text-white' : 'text-deep-100/80',
                      )}
                    >
                      {dayById(slot.dayId).label}
                    </span>
                    <span
                      className={cn(
                        'font-mono text-xs tabular-nums',
                        isNext ? 'text-sky-200' : 'text-deep-100/55',
                      )}
                    >
                      {formatRange(slot.start, slot.end)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
