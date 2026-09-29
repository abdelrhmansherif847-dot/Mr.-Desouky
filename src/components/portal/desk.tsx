import Link from 'next/link'
import { DateChip, EmptyState, StatusPill } from '@/components/portal/widgets'
import { ProgressBar } from '@/components/ui/Progress'
import { ArrowRight } from '@/components/ui/Button'
import type { NextAction, OutstandingHomework, ResultEntry } from '@/lib/portal/insights'
import type { Achievement, FeedbackNote, SessionRecord, TopicResult } from '@/lib/portal/types'
import { cn, formatLongDate } from '@/lib/utils'

/**
 * The building blocks of the student's desk and the parent's overview. Each
 * one takes exactly what it shows and renders an honest empty line when
 * there is nothing — never a placeholder that could be read as a result.
 */

export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600 hover:text-sky-700"
    >
      {children}
      <ArrowRight />
    </Link>
  )
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-block py-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
      {children}
    </Link>
  )
}

const ACTION_TONES: Record<NextAction['tone'], { bar: string; eyebrow: string }> = {
  alert: { bar: 'bg-alert-500', eyebrow: 'text-alert-600' },
  sky: { bar: 'bg-sky-500', eyebrow: 'text-sky-600' },
  growth: { bar: 'bg-growth-400', eyebrow: 'text-growth-600' },
  neutral: { bar: 'bg-deep-300', eyebrow: 'text-deep-400' },
}

/** The one thing to do next — or a calm line saying nothing is waiting. */
export function NextActionCard({
  action,
  href,
  audience = 'student',
}: {
  action: NextAction | null
  href: string
  audience?: 'student' | 'parent'
}) {
  if (!action) {
    return (
      <div className="flex h-full flex-col justify-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-growth-600">Next step</p>
        <p className="mt-2 font-display text-lg font-bold text-deep-700">
          {audience === 'student' ? 'Nothing is waiting on you.' : 'Nothing is outstanding.'}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
          No homework is due and there is no preparation set. New work appears here as soon as it is
          assigned.
        </p>
      </div>
    )
  }
  const tone = ACTION_TONES[action.tone]
  return (
    <div className="relative flex h-full flex-col pl-4">
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1 rounded-full', tone.bar)} />
      <p className={cn('font-mono text-[0.6rem] uppercase tracking-[0.14em]', tone.eyebrow)}>Next step</p>
      <p className="mt-2 break-words font-display text-lg font-bold leading-snug text-deep-700 sm:text-xl">
        {action.title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-deep-500">{action.detail}</p>
      <div className="mt-auto pt-4">
        <SectionLink href={href}>Open</SectionLink>
      </div>
    </div>
  )
}

/** The next scheduled session, large. */
export function NextSessionCard({
  session,
  bare,
}: {
  session: SessionRecord | undefined
  /** Leave out the eyebrow when the surrounding panel already names it. */
  bare?: boolean
}) {
  if (!session) {
    return (
      <div className="flex h-full flex-col justify-center">
        {bare ? null : (
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">Next session</p>
        )}
        <p className="font-display text-lg font-bold text-deep-700">Nothing scheduled yet</p>
        <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
          The next session appears here once it is on the calendar.
        </p>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col">
      {bare ? null : (
        <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sky-600">Next session</p>
      )}
      <div className="flex items-start gap-4">
        <DateChip iso={session.date} tone="sky" />
        <div className="min-w-0 flex-1">
          <p className="break-words font-display text-base font-bold leading-snug text-deep-700">{session.topic}</p>
          <p className="mt-1 text-xs text-deep-400">
            {[formatLongDate(session.date), session.time, session.stage].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      {session.prepare ? (
        <p className="mt-4 rounded-lg bg-sky-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-deep-600">
          <span className="font-semibold text-sky-700">Prepare: </span>
          {session.prepare}
        </p>
      ) : null}
    </div>
  )
}

export function HomeworkList({ items, limit = 4 }: { items: OutstandingHomework[]; limit?: number }) {
  if (items.length === 0) return <EmptyState>No homework outstanding.</EmptyState>
  return (
    <ul className="space-y-2.5">
      {items.slice(0, limit).map((hw) => (
        <li
          key={hw.id}
          className={cn(
            'flex items-start gap-3.5 rounded-card p-3.5',
            hw.overdue ? 'bg-alert-50/60 ring-1 ring-inset ring-alert-100' : 'bg-mist',
          )}
        >
          <DateChip iso={hw.dueOn} tone={hw.overdue ? 'neutral' : 'sky'} />
          <div className="min-w-0 flex-1">
            <p className="break-words font-display text-sm font-bold text-deep-700">{hw.title}</p>
            <p className={cn('mt-0.5 text-xs', hw.overdue ? 'font-semibold text-alert-700' : 'text-deep-400')}>
              {hw.overdue ? 'Overdue' : 'Due'} {formatLongDate(hw.dueOn)} · {hw.topic}
            </p>
            {typeof hw.progress === 'number' && hw.progress > 0 ? (
              <div className="mt-2.5 max-w-[14rem]">
                <ProgressBar value={hw.progress} valueLabel={`${hw.progress}%`} tone="sky" size="sm" />
              </div>
            ) : null}
          </div>
        </li>
      ))}
      {items.length > limit ? (
        <li className="px-1 text-xs text-deep-400">+ {items.length - limit} more</li>
      ) : null}
    </ul>
  )
}

export function SessionList({ sessions, empty }: { sessions: SessionRecord[]; empty: string }) {
  if (sessions.length === 0) return <EmptyState>{empty}</EmptyState>
  return (
    <ul className="space-y-3">
      {sessions.map((s) => (
        <li key={s.id} className="flex items-start gap-3">
          <DateChip iso={s.date} tone="sky" />
          <div className="min-w-0 flex-1">
            <p className="break-words font-display text-sm font-semibold text-deep-700">{s.topic}</p>
            <p className="mt-0.5 text-xs text-deep-400">
              {[formatLongDate(s.date), s.time, s.stage].filter(Boolean).join(' · ')}
            </p>
          </div>
          <StatusPill status={s.status} />
        </li>
      ))}
    </ul>
  )
}

export function ResultsList({ results }: { results: ResultEntry[] }) {
  if (results.length === 0) return <EmptyState>No quiz or mock results yet.</EmptyState>
  return (
    <ul className="space-y-4">
      {results.map((r) => (
        <li key={`${r.kind}-${r.id}`}>
          <ProgressBar
            label={r.title}
            valueLabel={`${r.score}/${r.total}`}
            value={r.percent}
            tone={r.kind === 'mock' ? 'olive' : r.percent >= 80 ? 'growth' : 'sky'}
            size="sm"
          />
          <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
            {r.kind === 'mock' ? 'Mock exam' : 'Quiz'} · {formatLongDate(r.date)}
          </p>
        </li>
      ))}
    </ul>
  )
}

/** Topic bars. Red only for a topic that genuinely needs work. */
export function TopicBars({ topics, empty }: { topics: TopicResult[]; empty: string }) {
  if (topics.length === 0) return <EmptyState>{empty}</EmptyState>
  return (
    <ul className="space-y-4">
      {topics.map((topic) => (
        <li key={topic.name}>
          <ProgressBar
            label={topic.name}
            valueLabel={`${topic.score}%`}
            value={topic.score}
            tone={topic.status === 'strong' ? 'growth' : topic.status === 'weak' ? 'alert' : 'sky'}
            size="sm"
          />
        </li>
      ))}
    </ul>
  )
}

/** Written feedback — only the parts that were actually written. */
export function FeedbackBody({ note, compact }: { note: FeedbackNote; compact?: boolean }) {
  const parts = [
    { q: 'What happened', a: note.what },
    { q: 'Why', a: note.why },
    { q: 'What to improve', a: note.improve },
    { q: 'Next step', a: note.next },
  ].filter((part): part is { q: string; a: string } => Boolean(part.a))
  return (
    <dl className={cn('grid gap-3', !compact && parts.length > 1 && 'sm:grid-cols-2')}>
      {parts.map((item) => (
        <div key={item.q} className="rounded-lg bg-mist p-3.5">
          <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-growth-600">{item.q}</dt>
          <dd className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-deep-600">{item.a}</dd>
        </div>
      ))}
    </dl>
  )
}

export function AchievementGrid({ items, stacked }: { items: Achievement[]; stacked?: boolean }) {
  return (
    <ul className={cn('grid gap-3', stacked ? 'sm:grid-cols-2 lg:grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3')}>
      {items.map((a) => (
        <li key={a.id} className="rounded-card border border-growth-100 bg-growth-50/50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-growth-100 text-growth-700">
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M10 2.5 12.2 7l5 .7-3.6 3.5.85 4.95L10 13.8l-4.45 2.35.85-4.95L2.8 7.7l5-.7L10 2.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="break-words font-display text-sm font-bold text-deep-700">{a.title}</p>
              {a.description ? (
                <p className="mt-1 text-xs leading-relaxed text-deep-500">{a.description}</p>
              ) : null}
              <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
                {[a.kind, formatLongDate(a.earnedOn)].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
