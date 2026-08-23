import { Section, SectionHeading } from '@/components/ui/Section'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { SYSTEM_STAGES } from '@/content/system'
import { cn } from '@/lib/utils'

const toneStyles = {
  sky: { dot: 'bg-sky-500', ring: 'ring-sky-200', text: 'text-sky-600', soft: 'bg-sky-50' },
  deep: { dot: 'bg-deep-600', ring: 'ring-deep-200', text: 'text-deep-600', soft: 'bg-deep-50' },
  growth: { dot: 'bg-growth-400', ring: 'ring-growth-200', text: 'text-growth-600', soft: 'bg-growth-50' },
  olive: { dot: 'bg-olive-500', ring: 'ring-olive-200', text: 'text-olive-600', soft: 'bg-olive-50' },
} as const

/** Compact horizontal flow — used on the home page. */
export function SystemFlowCompact() {
  return (
    <Section tone="mist" id="system">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="The educational system"
          title="Every stage has a purpose"
          lead="Nothing in the process is there by accident. Each stage does one job, and each one feeds the next."
        />
        <ButtonLink href="/how-it-works" variant="secondary" className="group shrink-0 self-start lg:self-auto">
          See the full system
          <ArrowRight />
        </ButtonLink>
      </div>

      <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {SYSTEM_STAGES.map((stage, i) => {
          const tone = toneStyles[stage.tone]
          return (
            <li
              key={stage.id}
              className={cn(
                'group relative rounded-card border border-deep-100 bg-white p-5 transition-all duration-300 ease-calm hover:-translate-y-1 hover:shadow-card',
                // Last card spans to fill the 4-column grid neatly
                i === SYSTEM_STAGES.length - 1 && 'sm:col-span-2 lg:col-span-1',
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={cn('h-2 w-2 shrink-0 rounded-full ring-4', tone.dot, tone.ring)} />
                <span className="font-mono text-[0.65rem] font-semibold tracking-[0.14em] text-deep-300">
                  {stage.index}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-deep-700">{stage.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-deep-500">{stage.purpose}</p>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

/** Full vertical breakdown — used on /how-it-works. */
export function SystemFlowFull() {
  return (
    <div className="space-y-4">
      {SYSTEM_STAGES.map((stage, i) => {
        const tone = toneStyles[stage.tone]
        const last = i === SYSTEM_STAGES.length - 1

        return (
          <div key={stage.id} id={stage.id} className="relative scroll-mt-28">
            <div className="grid gap-6 rounded-panel border border-deep-100 bg-white p-6 sm:p-8 lg:grid-cols-12 lg:gap-10">
              {/* Index + title */}
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold',
                      tone.soft,
                      tone.text,
                    )}
                  >
                    {stage.index}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-deep-700">{stage.title}</h2>
                </div>
                <p className={cn('mt-4 font-display text-base font-semibold', tone.text)}>
                  {stage.purpose}
                </p>
              </div>

              {/* Body + detail */}
              <div className="lg:col-span-8">
                <p className="text-[0.98rem] leading-relaxed text-deep-500">{stage.body}</p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  {stage.detail.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 rounded-lg bg-mist px-3 py-2.5 text-[0.82rem] leading-snug text-deep-600"
                    >
                      <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', tone.dot)} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {!last ? (
              <div aria-hidden="true" className="flex justify-center py-1">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-deep-200">
                  <path
                    d="M12 4v16m0 0-6-6m6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
