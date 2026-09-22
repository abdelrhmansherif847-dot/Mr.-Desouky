'use client'

import { useState, useSyncExternalStore, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import {
  VIEWER_GROUP_ID,
  WEEK_DAYS,
  dayForDate,
  formatDuration,
  formatRange,
  groupOf,
  isMine,
  slotsForDay,
  type WeekdayId,
} from '@/content/week'

/**
 * The teaching week, from the student's side of it.
 *
 * A student sees their own sessions in full and every other slot as simply
 * "Booked" — no group, no size, nothing. Who else is taught on a Tuesday
 * evening is not theirs to read, and the surest way to keep it that way is for
 * the component never to be handed it. The unlabelled slots are still drawn
 * because a timetable with holes in it reads as a mistake; showing the shape of
 * the week without its contents is both honest and more useful.
 *
 * The day selector reuses the indicator pattern proven on the sign-in screen:
 * one element moves, on the one easing allowed to overshoot, and the days park
 * left-to-right so the panels slide in the direction the eye just travelled.
 */
/** The clock is not a React value; it never changes after the first read. */
const subscribe = () => () => {}
const todayOnClient = () => dayForDate(new Date())?.id
/** The server has no "today" to know, so it renders the first day instead. */
const todayOnServer = () => undefined

export function WeekBoard({ viewerGroupId = VIEWER_GROUP_ID }: { viewerGroupId?: string }) {
  // useSyncExternalStore rather than an effect: the server and the browser
  // legitimately disagree about what day it is, and this is the API built for
  // exactly that — it renders the server's answer, then re-renders with the
  // browser's, with no hydration mismatch and no flash of the wrong state.
  const today = useSyncExternalStore(subscribe, todayOnClient, todayOnServer)
  const [chosen, setChosen] = useState<WeekdayId | null>(null)

  // What the student picked, else the day it actually is, else the first day.
  const active: WeekdayId = chosen ?? today ?? WEEK_DAYS[0].id
  const setActive = setChosen
  const activeIndex = WEEK_DAYS.findIndex((day) => day.id === active)

  return (
    <section
      aria-labelledby="week-heading"
      className="rounded-panel border border-deep-100 bg-white"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-deep-100 px-5 py-4 sm:px-6">
        <div>
          <h2 id="week-heading" className="font-display text-base font-bold text-deep-700">
            The teaching week
          </h2>
          <p className="mt-0.5 text-xs text-deep-500">Your sessions, and when the week is busy</p>
        </div>

        <div
          role="group"
          aria-label="Choose a day"
          className="relative grid grid-cols-3 gap-1 rounded-full bg-deep-50 p-1 ring-1 ring-inset ring-deep-100"
          onKeyDown={(event) => {
            const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
            if (!step) return
            event.preventDefault()
            const next = (activeIndex + step + WEEK_DAYS.length) % WEEK_DAYS.length
            setActive(WEEK_DAYS[next].id)
          }}
        >
          <span
            aria-hidden="true"
            style={{ transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))` }}
            className={cn(
              'absolute inset-y-1 left-1 w-[calc(33.333%-0.333rem)] rounded-full bg-white',
              'shadow-[0_1px_2px_rgba(18,59,93,0.10),0_6px_16px_-6px_rgba(18,59,93,0.34)]',
              'ring-1 ring-inset ring-white',
              'transition-transform duration-[420ms] ease-spring motion-reduce:transition-none',
            )}
          />
          {WEEK_DAYS.map((day) => {
            const selected = day.id === active
            return (
              <button
                key={day.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(day.id)}
                className={cn(
                  'relative z-10 rounded-full px-3 py-1.5 font-display text-xs font-semibold sm:px-4 sm:text-sm',
                  'transition-[color,transform] duration-200 ease-smooth',
                  'active:scale-[0.97] active:duration-[120ms] motion-reduce:active:scale-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                  selected ? 'text-deep-700' : 'text-deep-500 hover:text-deep-700',
                )}
              >
                <span className="sm:hidden">{day.short}</span>
                <span className="hidden sm:inline">{day.label}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Every day is rendered and stacked in one grid cell, so the panel is
          always as tall as the fullest day and nothing below it moves when the
          selection changes. The inactive days are inert and hidden from
          assistive technology. */}
      <div className="grid px-5 py-5 sm:px-6">
        {WEEK_DAYS.map((day, index) => {
          const selected = day.id === active
          const offset = index - activeIndex
          return (
            <div
              key={day.id}
              inert={!selected}
              aria-hidden={!selected}
              style={{ '--dir': offset } as CSSProperties}
              className={cn(
                'col-start-1 row-start-1',
                'transition-[opacity,transform,visibility] duration-[420ms] ease-calm',
                'motion-reduce:transition-none',
                selected
                  ? 'visible translate-x-0 opacity-100'
                  : 'invisible translate-x-[calc(var(--dir)_*_14px)] opacity-0',
              )}
            >
              <ol className="space-y-2.5">
                {slotsForDay(day.id).map((slot) => {
                  const mine = isMine(slot, viewerGroupId)
                  return (
                    <li
                      key={slot.id}
                      className={cn(
                        'flex items-center gap-4 rounded-card px-4 py-3.5',
                        'transition-colors duration-200 ease-smooth motion-reduce:transition-none',
                        mine
                          ? 'bg-sky-50/70 ring-1 ring-inset ring-sky-200/70'
                          : 'bg-mist ring-1 ring-inset ring-transparent',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'h-9 w-1 shrink-0 rounded-full',
                          mine ? 'bg-sky-500' : 'bg-deep-200',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'font-mono text-sm font-semibold tabular-nums',
                            mine ? 'text-deep-700' : 'text-deep-500',
                          )}
                        >
                          {formatRange(slot.start, slot.end)}
                        </p>
                        <p className="mt-0.5 text-xs text-deep-500">
                          {formatDuration(slot.start, slot.end)}
                          {mine ? ` · ${groupOf(slot)?.label}` : null}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] ring-1 ring-inset',
                          mine
                            ? 'bg-sky-100 text-sky-700 ring-sky-200/70'
                            : 'bg-white text-deep-500 ring-deep-200/60',
                        )}
                      >
                        {mine ? 'Yours' : 'Booked'}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          )
        })}
      </div>
    </section>
  )
}
