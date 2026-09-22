import { Reveal } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'
import { formatLongDate } from '@/lib/utils'
import type { StudentRecord } from '@/lib/portal/types'
import { topicsByStatus, upcomingSessions } from '@/lib/portal/data'

/**
 * What actually needs the student today.
 *
 * Every item is derived from the record — nothing here is written by hand, so
 * the list empties itself when there is genuinely nothing to do rather than
 * inventing urgency to fill a panel.
 *
 * Red is spent carefully. A missed piece of work is red because it is a real
 * lapse; homework merely due is sky, because it is simply the next thing; a
 * weak topic is olive, because it is a direction to study in rather than an
 * alarm. Making everything red would make none of it mean anything.
 */

type Item = {
  id: string
  tone: 'alert' | 'sky' | 'olive'
  label: string
  title: string
  detail: string
}

const TONES = {
  alert: { dot: 'bg-alert-500', chip: 'text-alert-700 bg-alert-50 ring-alert-200/70' },
  sky: { dot: 'bg-sky-500', chip: 'text-sky-700 bg-sky-50 ring-sky-200/70' },
  olive: { dot: 'bg-olive-500', chip: 'text-olive-700 bg-olive-50 ring-olive-200/70' },
} as const

function build(record: StudentRecord): Item[] {
  const items: Item[] = []

  for (const work of record.homework) {
    if (work.status === 'missed') {
      items.push({
        id: work.id,
        tone: 'alert',
        label: 'Missed',
        title: work.title,
        detail: work.note ?? `Was due ${formatLongDate(work.dueOn)}.`,
      })
    } else if (work.status === 'pending') {
      items.push({
        id: work.id,
        tone: 'sky',
        label: 'Due',
        title: work.title,
        detail: `Due ${formatLongDate(work.dueOn)} · ${work.topic}`,
      })
    }
  }

  const next = upcomingSessions(record).find((session) => session.prepare)
  if (next?.prepare) {
    items.push({
      id: next.id,
      tone: 'sky',
      label: 'Prepare',
      title: next.topic,
      detail: next.prepare,
    })
  }

  const weakest = topicsByStatus(record, 'weak').slice(-1)[0]
  if (weakest) {
    items.push({
      id: `topic-${weakest.name}`,
      tone: 'olive',
      label: 'Focus',
      title: weakest.name,
      detail: `${weakest.score}% across ${weakest.attempts} questions — this is where the next marks are.`,
    })
  }

  return items
}

export function Attention({ record }: { record: StudentRecord }) {
  const items = build(record)

  return (
    <Reveal
      as="section"
      variant="up"
      aria-labelledby="attention-heading"
      className="rounded-panel border border-deep-100 bg-white"
    >
      <header className="border-b border-deep-100 px-5 py-4 sm:px-6">
        <h2 id="attention-heading" className="font-display text-base font-bold text-deep-700">
          Needs your attention
        </h2>
        <p className="mt-0.5 text-xs text-deep-500">
          {items.length === 0 ? 'Nothing outstanding' : `${items.length} things to deal with`}
        </p>
      </header>

      <div className="px-5 py-5 sm:px-6">
        {items.length === 0 ? (
          <p className="rounded-card border border-dashed border-growth-200 bg-growth-50/50 px-4 py-6 text-center text-sm text-growth-700">
            You are completely up to date. Enjoy it.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', TONES[item.tone].dot)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-bold text-deep-700">{item.title}</p>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.1em] ring-1 ring-inset',
                        TONES[item.tone].chip,
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-deep-500">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  )
}
