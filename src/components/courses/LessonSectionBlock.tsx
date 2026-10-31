import type { ReactNode } from 'react'
import type { SectionState } from '@/content/curriculum'
import { OBJECTIVE_REVIEW_LABEL } from '@/content/curriculum'
import { cn } from '@/lib/utils'

/**
 * One part of a lesson page. Its state comes from the course model:
 * draft content carries the review label, and a planned part says plainly
 * that nothing has been published for it yet.
 */
export function LessonSectionBlock({
  id,
  index,
  label,
  state,
  children,
}: {
  id: string
  index: number
  label: string
  state: SectionState
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-section={id}
      data-state={state}
      className={cn(
        'scroll-mt-28 rounded-panel border p-5 sm:p-7',
        state === 'planned' ? 'border-dashed border-deep-200 bg-white/60' : 'border-deep-100 bg-white shadow-card',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span aria-hidden="true" className="font-mono text-[0.68rem] font-semibold tabular-nums tracking-[0.14em] text-sky-600">
          {String(index).padStart(2, '0')}
        </span>
        <h2 id={`${id}-title`} className="font-display text-lg font-bold text-deep-700 sm:text-xl">
          {label}
        </h2>
        {state === 'draft' ? (
          <span className="rounded-full bg-olive-50 px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-olive-700 ring-1 ring-inset ring-olive-200/70">
            {OBJECTIVE_REVIEW_LABEL.draft}
          </span>
        ) : null}
        {state === 'planned' ? (
          <span className="rounded-full bg-mist px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-deep-500 ring-1 ring-inset ring-deep-200/70">
            Planned · not yet published
          </span>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}
