import { PreviewNotice } from '@/components/portal/PreviewNotice'
import { Panel } from '@/components/portal/widgets'
import { getStudentRecord } from '@/lib/portal/data'
import { JOURNEY_STAGES } from '@/content/journey'
import { formatLongDate, cn } from '@/lib/utils'

export default async function StudentJourneyPage() {
  const record = await getStudentRecord()
  const current = record.profile.currentStageIndex

  return (
    <div className="space-y-5">
      <PreviewNotice audience="student" />

      <Panel
        title="My journey"
        description={`Target exam date: ${formatLongDate(record.profile.targetExamDate)}`}
      >
        <ol className="space-y-0">
          {JOURNEY_STAGES.map((stage, i) => {
            const done = i < current
            const active = i === current
            const last = i === JOURNEY_STAGES.length - 1

            return (
              <li key={stage.id} className="flex gap-4 sm:gap-6">
                {/* Rail */}
                <div className="flex shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-xs font-bold',
                      done && 'border-growth-300 bg-growth-300 text-white',
                      active && 'border-sky-500 bg-sky-500 text-white',
                      !done && !active && 'border-deep-100 bg-white text-deep-300',
                    )}
                  >
                    {done ? (
                      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                        <path
                          d="M3.5 8.5 6.5 11.5 12.5 5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      stage.index
                    )}
                  </span>
                  {!last ? (
                    <span
                      aria-hidden="true"
                      className={cn('w-0.5 flex-1', done ? 'bg-growth-200' : 'bg-deep-100')}
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className={cn('min-w-0 flex-1', last ? 'pb-0' : 'pb-7')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={cn(
                        'font-display text-base font-bold',
                        active ? 'text-sky-700' : 'text-deep-700',
                      )}
                    >
                      {stage.title}
                    </h3>
                    {active ? (
                      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-sky-700 ring-1 ring-inset ring-sky-200/70">
                        You are here
                      </span>
                    ) : null}
                    {done ? (
                      <span className="rounded-full bg-growth-50 px-2.5 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-growth-700 ring-1 ring-inset ring-growth-200/70">
                        Complete
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm font-medium text-deep-500">{stage.tagline}</p>

                  {active ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-card bg-mist p-3.5">
                        <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">
                          What you see now
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-deep-600">{stage.studentSees}</p>
                      </div>
                      <div className="rounded-card bg-growth-50 p-3.5">
                        <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-growth-600">
                          Outcome
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-deep-600">{stage.outcome}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </Panel>
    </div>
  )
}
