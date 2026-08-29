'use client'

import { useEffect, useRef, useState } from 'react'
import { SessionCard } from '@/components/schedule/SessionCard'
import { TimeValue } from '@/components/schedule/Time'
import { Reveal } from '@/components/motion/Reveal'
import {
  SCHEDULE_DAYS,
  TIME_SLOTS,
  slotIndex,
  type ScheduleDay,
} from '@/content/schedule'
import { staggerDelay } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * The weekly schedule.
 *
 * Desktop is a proportional timeline: row heights follow real duration, so a
 * two-hour session is visibly twice a one-hour break and the shape of the day
 * can be read before any text is.
 *
 * Mobile is not that grid squeezed down — it is a day selector plus a single
 * day's timeline, which is how someone actually uses a timetable on a phone.
 *
 * The whole component is right-to-left and Arabic-first.
 */

/** One hour of the day, in rem. Row heights derive from this. */
const HOUR = 4.5

function rowTemplate(): string {
  return TIME_SLOTS.map((slot) => `${(slot.minutes / 60) * HOUR}rem`).join(' ')
}

function TodayBadge() {
  return (
    <span className="rounded-full bg-growth-100 px-2 py-0.5 text-[0.62rem] font-bold text-growth-700 ring-1 ring-inset ring-growth-200/70">
      اليوم
    </span>
  )
}

function DayHeading({ day, today, className }: { day: ScheduleDay; today: boolean; className?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-2', className)}>
      <div>
        <h3 className="text-base font-bold text-deep-700 sm:text-lg">{day.name}</h3>
        <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
          {day.english}
        </p>
      </div>
      {today ? <TodayBadge /> : null}
    </div>
  )
}

/** Sessions laid onto the shared time grid, so every day stays aligned. */
function DayColumn({ day, animate }: { day: ScheduleDay; animate: boolean }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateRows: rowTemplate() }}>
      {day.sessions.map((session, i) => {
        const start = slotIndex(session.slotId)
        const slot = TIME_SLOTS[start]
        if (!slot) return null

        const placement = { gridRow: `${start + 1} / span ${session.span ?? 1}` }

        // Reveal owns the hidden/shown state. Setting data-reveal by hand
        // would hide the card with nothing ever to un-hide it.
        if (!animate) {
          return (
            <div key={`${day.id}-${session.slotId}`} style={placement} className="min-h-0">
              <SessionCard session={session} slot={slot} />
            </div>
          )
        }

        return (
          <Reveal
            key={`${day.id}-${session.slotId}`}
            variant="up"
            delay={staggerDelay(i)}
            style={placement}
            className="min-h-0"
          >
            <SessionCard session={session} slot={slot} />
          </Reveal>
        )
      })}
    </div>
  )
}

export function WeeklySchedule() {
  const [todayId, setTodayId] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState<string>(SCHEDULE_DAYS[0].id)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Today is resolved after mount: the server has no idea what day it is in
  // the visitor's timezone, and guessing would cause a hydration mismatch.
  // Deferred a frame so the state change lands in a callback rather than
  // synchronously inside the effect.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const weekday = new Date().getDay()
      const match = SCHEDULE_DAYS.find((d) => d.weekday === weekday)
      if (!match) return
      setTodayId(match.id)
      setActiveDay(match.id)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const activeIndex = SCHEDULE_DAYS.findIndex((d) => d.id === activeDay)

  /** Arrow keys follow what the eye sees, which is reversed under RTL. */
  function onTabKeyDown(event: React.KeyboardEvent) {
    const forward = event.key === 'ArrowLeft'
    const backward = event.key === 'ArrowRight'
    if (!forward && !backward && event.key !== 'Home' && event.key !== 'End') return

    event.preventDefault()
    let next = activeIndex
    if (forward) next = (activeIndex + 1) % SCHEDULE_DAYS.length
    if (backward) next = (activeIndex - 1 + SCHEDULE_DAYS.length) % SCHEDULE_DAYS.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = SCHEDULE_DAYS.length - 1

    setActiveDay(SCHEDULE_DAYS[next].id)
    tabRefs.current[next]?.focus()
  }

  const day = SCHEDULE_DAYS[activeIndex] ?? SCHEDULE_DAYS[0]

  return (
    <div dir="rtl" lang="ar">
      {/* ---------------- Desktop: full-week proportional timeline ---------------- */}
      <div className="hidden lg:block">
        <div className="rounded-panel border border-deep-100 bg-white p-5 xl:p-6">
          {/* Column headers, aligned with the grid below */}
          <div className="grid gap-3 border-b border-deep-100 pb-4" style={{ gridTemplateColumns: '5.75rem repeat(4, minmax(0, 1fr))' }}>
            <div className="flex items-end">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
                الوقت
              </span>
            </div>
            {SCHEDULE_DAYS.map((d) => (
              <div
                key={d.id}
                className={cn(
                  'rounded-card px-3 py-2 transition-colors duration-300',
                  d.id === todayId ? 'bg-growth-50 ring-1 ring-inset ring-growth-200/70' : 'bg-mist/60',
                )}
              >
                <DayHeading day={d} today={d.id === todayId} />
              </div>
            ))}
          </div>

          {/* Time rail + day columns share one row template, so they line up */}
          <div className="grid gap-3 pt-4" style={{ gridTemplateColumns: '5.75rem repeat(4, minmax(0, 1fr))' }}>
            <div className="grid gap-2" style={{ gridTemplateRows: rowTemplate() }}>
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-col items-end justify-center gap-0.5 border-e border-deep-100/70 pe-3"
                >
                  <TimeValue value={slot.start} className="text-[0.74rem] font-semibold text-deep-600" />
                  <TimeValue value={slot.end} className="text-[0.64rem] text-deep-300" />
                </div>
              ))}
            </div>

            {SCHEDULE_DAYS.map((d) => (
              <DayColumn key={d.id} day={d} animate />
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Mobile: day selector + one day at a time ---------------- */}
      <div className="lg:hidden">
        <div
          role="tablist"
          aria-label="أيام الجدول"
          aria-orientation="horizontal"
          onKeyDown={onTabKeyDown}
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
        >
          {SCHEDULE_DAYS.map((d, i) => {
            const selected = d.id === activeDay
            return (
              <button
                key={d.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                type="button"
                id={`tab-${d.id}`}
                aria-selected={selected}
                aria-controls={`panel-${d.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveDay(d.id)}
                className={cn(
                  'relative shrink-0 rounded-full px-4 py-2.5 text-sm font-bold',
                  'transition-[background-color,color,transform,box-shadow] duration-200 ease-smooth',
                  'active:scale-[0.97] motion-reduce:active:scale-100',
                  selected
                    ? 'bg-deep-700 text-white shadow-card'
                    : 'bg-mist text-deep-600 hover:bg-deep-50',
                )}
              >
                {d.name}
                {d.id === todayId ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -top-0.5 end-1 h-2 w-2 rounded-full ring-2',
                      selected ? 'bg-growth-300 ring-deep-700' : 'bg-growth-400 ring-mist',
                    )}
                  />
                ) : null}
              </button>
            )
          })}
        </div>

        {/* The panel is keyed on the day so its entrance replays when it changes */}
        <div
          key={day.id}
          role="tabpanel"
          id={`panel-${day.id}`}
          aria-labelledby={`tab-${day.id}`}
          tabIndex={0}
          className="page-enter mt-4 rounded-panel border border-deep-100 bg-white p-4 focus-visible:outline-none sm:p-5"
        >
          <DayHeading day={day} today={day.id === todayId} className="mb-4" />

          <ol className="space-y-2.5">
            {day.sessions.map((session, i) => {
              const start = slotIndex(session.slotId)
              const slot = TIME_SLOTS[start]
              if (!slot) return null
              const end = TIME_SLOTS[start + (session.span ?? 1) - 1] ?? slot

              return (
                <Reveal as="li" key={session.slotId} index={i} variant="up" className="flex gap-3">
                  {/* Time rail runs down the start edge, which is the right in RTL */}
                  <div className="flex w-[4.5rem] shrink-0 flex-col items-end border-e border-deep-100/70 pe-3 pt-3.5">
                    <TimeValue value={slot.start} className="text-[0.74rem] font-semibold text-deep-600" />
                    <TimeValue value={end.end} className="text-[0.64rem] text-deep-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <SessionCard session={session} slot={slot} compact />
                  </div>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
