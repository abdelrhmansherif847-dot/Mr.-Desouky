import { Reveal } from '@/components/motion/Reveal'
import { CountUp } from '@/components/motion/CountUp'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/utils'
import type { HomeworkStatus, SessionStatus, TopicStatus } from '@/lib/portal/types'

/** A titled panel — the base container for every dashboard block. */
export function Panel({
  title,
  action,
  children,
  className,
  description,
  index,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Position within a dashboard column, for a gentle stagger. */
  index?: number
}) {
  return (
    <Reveal
      as="section"
      variant="up"
      index={index}
      className={cn('rounded-panel border border-deep-100 bg-white', className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-deep-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-base font-bold text-deep-700">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-deep-400">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </Reveal>
  )
}

/** Headline number. Neutral by default — green only for genuine progress. */
export function StatTile({
  label,
  value,
  unit,
  hint,
  tone = 'neutral',
  countTo,
  countSuffix = '',
  index,
}: {
  label: string
  value: string | number
  unit?: string
  hint?: string
  tone?: 'neutral' | 'growth' | 'sky' | 'alert'
  /**
   * Counts up from zero when scrolled into view. Set this only where the
   * figure is progress the student actually made — attendance, completion,
   * scores. Plain counts of things stay static, because watching them tick
   * would be noise rather than meaning.
   */
  countTo?: number
  countSuffix?: string
  index?: number
}) {
  const tones = {
    neutral: 'text-deep-700',
    growth: 'text-growth-600',
    sky: 'text-sky-600',
    alert: 'text-alert-600',
  }

  return (
    <Reveal
      variant="scale"
      index={index}
      className="rounded-card border border-deep-100 bg-white p-4 sm:p-5"
    >
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">{label}</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className={cn('font-display text-2xl font-bold tabular-nums sm:text-3xl', tones[tone])}>
          {countTo !== undefined ? <CountUp value={countTo} suffix={countSuffix} /> : value}
        </span>
        {unit ? <span className="text-sm font-medium text-deep-400">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1.5 text-xs leading-snug text-deep-400">{hint}</p> : null}
    </Reveal>
  )
}

const STATUS_STYLES = {
  attended: { label: 'Attended', cls: 'bg-growth-50 text-growth-700 ring-growth-200/70' },
  upcoming: { label: 'Upcoming', cls: 'bg-sky-50 text-sky-700 ring-sky-200/70' },
  missed: { label: 'Missed', cls: 'bg-alert-50 text-alert-700 ring-alert-200/70' },
  cancelled: { label: 'Cancelled', cls: 'bg-deep-50 text-deep-600 ring-deep-200/70' },
  completed: { label: 'Completed', cls: 'bg-growth-50 text-growth-700 ring-growth-200/70' },
  pending: { label: 'Due', cls: 'bg-sky-50 text-sky-700 ring-sky-200/70' },
  late: { label: 'Late', cls: 'bg-olive-50 text-olive-700 ring-olive-200/70' },
  strong: { label: 'Strong', cls: 'bg-growth-50 text-growth-700 ring-growth-200/70' },
  developing: { label: 'Developing', cls: 'bg-sky-50 text-sky-700 ring-sky-200/70' },
  weak: { label: 'Needs work', cls: 'bg-alert-50 text-alert-700 ring-alert-200/70' },
} as const

export function StatusPill({
  status,
}: {
  status: SessionStatus | HomeworkStatus | TopicStatus
}) {
  const style = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] ring-1 ring-inset',
        style.cls,
      )}
    >
      {style.label}
    </span>
  )
}

/** Compact date chip used down the left of list rows. */
export function DateChip({ iso, tone = 'neutral' }: { iso: string; tone?: 'neutral' | 'sky' }) {
  return (
    <span
      className={cn(
        'inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl font-mono text-[0.65rem] font-semibold leading-tight',
        tone === 'sky' ? 'bg-sky-50 text-sky-700' : 'bg-mist text-deep-500',
      )}
    >
      {formatShortDate(iso)
        .split(' ')
        .map((part) => (
          <span key={part}>{part}</span>
        ))}
    </span>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-deep-200 px-4 py-6 text-center text-sm text-deep-400">
      {children}
    </p>
  )
}

/**
 * A whole section with nothing in it yet — said plainly, with what will
 * appear and who puts it there. Never a zero dressed up as a result: a new
 * student's 0% attendance would be a fabricated number, so there is no tile
 * at all until there is something to count.
 */
export function EmptyPanel({
  title,
  children,
  icon = 'M4 19V9m5 10V5m5 14v-7m5 7V7',
}: {
  title: string
  children: React.ReactNode
  /** A 24×24 stroke path in the portal's icon language. */
  icon?: string
}) {
  return (
    <section className="rounded-panel border border-deep-100 bg-white px-6 py-10 text-center sm:px-10 sm:py-12">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 ring-1 ring-inset ring-sky-100">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-500" aria-hidden="true">
          <path d={icon} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-deep-700">{title}</h2>
      <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-deep-500">{children}</div>
    </section>
  )
}
