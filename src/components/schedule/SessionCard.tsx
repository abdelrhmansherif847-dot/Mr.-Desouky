import { ADDITIONAL_LABEL, KIND_LABELS, type Session, type TimeSlot } from '@/content/schedule'
import { TimeRange } from '@/components/schedule/Time'
import { cn } from '@/lib/utils'

/**
 * One cell of the timetable.
 *
 * Session types are told apart by hierarchy first — weight, size, surface and
 * icon — with colour only reinforcing it. Every colour used is already in the
 * brand system; no day gets an arbitrary hue of its own.
 */

function Icon({ kind }: { kind: Session['kind'] }) {
  const paths: Record<Session['kind'], string> = {
    // Group of students.
    lesson: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0c-2.5 0-4.5 1.6-4.5 3.6V16h9v-1.4C12.5 12.6 10.5 11 8 11Zm6.5 5v-1.3c0-1.4-.8-2.6-2-3.2M12.4 5.2a2.6 2.6 0 0 1 0 5',
    // Cup — a break.
    break: 'M3.5 6h8v4.5a4 4 0 0 1-8 0V6Zm8 1h1.6a1.9 1.9 0 1 1 0 3.8h-.6M3 16h9',
    // Clock — open time.
    open: 'M8 3.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2.3V8l1.8 1.1',
    // A quieter, wider mark for a day with no teaching.
    clear: 'M3.5 8h9',
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path
        d={paths[kind]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Surfaces are ordered by how much attention each type deserves:
 * a lesson is a raised white card, a break recedes into the page,
 * open time is available but quiet.
 */
const surfaces: Record<Session['kind'], string> = {
  lesson:
    'border-deep-100 bg-white shadow-card border-s-[3px] border-s-sky-400 ' +
    'hover:-translate-y-0.5 hover:border-s-sky-500 hover:shadow-lift',
  break: 'border-deep-100/70 bg-mist/70 border-s-[3px] border-s-deep-200',
  open:
    'border-dashed border-sky-200 bg-sky-50/40 border-s-[3px] border-s-sky-200 ' +
    'hover:border-sky-300 hover:bg-sky-50/70',
  clear: 'border-dashed border-deep-200 bg-mist/60',
}

export function SessionCard({
  session,
  slot,
  compact = false,
}: {
  session: Session
  slot: TimeSlot
  /** Mobile list rows carry their own time, so the card omits it. */
  compact?: boolean
}) {
  const isLesson = session.kind === 'lesson'
  const isClear = session.kind === 'clear'
  const label = KIND_LABELS[session.kind]

  return (
    <div
      className={cn(
        'group/session flex h-full flex-col rounded-card border p-3.5 sm:p-4',
        'transition-[transform,box-shadow,border-color,background-color] duration-300 ease-calm',
        'motion-reduce:hover:translate-y-0',
        surfaces[session.kind],
        session.additional && 'border-s-olive-400 hover:border-s-olive-500',
        isClear && 'items-center justify-center text-center',
      )}
    >
      {isLesson ? (
        <>
          <div className="flex items-center gap-2 text-sky-600">
            <Icon kind="lesson" />
            <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em]">
              {label.title}
            </span>
            {session.additional ? (
              <span className="ms-auto rounded-full bg-olive-50 px-2 py-0.5 text-[0.62rem] font-semibold text-olive-700 ring-1 ring-inset ring-olive-200/70">
                {ADDITIONAL_LABEL}
              </span>
            ) : null}
          </div>

          {/* The group name is the point of the cell — it carries the weight. */}
          <p className="mt-2 text-[0.98rem] font-bold leading-snug text-deep-700 sm:text-[1.05rem]">
            {session.group}
          </p>

          {!compact ? (
            <p className="mt-auto pt-2">
              <TimeRange start={slot.start} end={slot.end} className="text-[0.68rem] font-medium text-deep-400" />
            </p>
          ) : null}
        </>
      ) : null}

      {session.kind === 'break' ? (
        <div className="flex h-full items-center gap-2 text-deep-400">
          <Icon kind="break" />
          <span className="text-sm font-medium">{label.title}</span>
        </div>
      ) : null}

      {session.kind === 'open' ? (
        <div className="flex h-full flex-col justify-center gap-1.5 text-sky-700/80">
          <div className="flex items-center gap-2">
            <Icon kind="open" />
            <span className="text-sm font-semibold">{label.title}</span>
          </div>
          {!compact ? (
            <TimeRange start={slot.start} end={slot.end} className="text-[0.68rem] font-medium text-sky-600/60" />
          ) : null}
        </div>
      ) : null}

      {isClear ? (
        <div className="flex flex-col items-center gap-2 px-2 text-deep-400">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-deep-300 ring-1 ring-inset ring-deep-100">
            <Icon kind="clear" />
          </span>
          <p className="text-sm font-semibold text-deep-500">{label.title}</p>
          {session.note ? (
            <p className="num text-[0.7rem] font-medium leading-relaxed text-deep-400">
              {session.note}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
