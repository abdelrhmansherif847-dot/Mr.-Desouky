import { Section, SectionHeading } from '@/components/ui/Section'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { JOURNEY_STAGES } from '@/content/journey'
import { cn } from '@/lib/utils'

/** Compact journey rail for the home page. */
export function JourneyPreview() {
  return (
    <Section tone="paper" id="journey">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="The student journey"
          title="From where the student is, to exam ready"
          lead="Seven stages, in order. At every point a student can answer four questions: where am I, what am I doing, why am I doing it, and what comes next."
        />
        <ButtonLink href="/journey" variant="secondary" className="group shrink-0 self-start lg:self-auto">
          See the full journey
          <ArrowRight />
        </ButtonLink>
      </div>

      <ol className="mt-12 space-y-0">
        {JOURNEY_STAGES.map((stage, i) => {
          const last = i === JOURNEY_STAGES.length - 1
          return (
            <li key={stage.id} className="group relative flex gap-5 sm:gap-7">
              {/* Rail */}
              <div className="flex shrink-0 flex-col items-center">
                <span
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-colors duration-300',
                    'border-deep-100 bg-white text-deep-400 group-hover:border-sky-400 group-hover:text-sky-600',
                  )}
                >
                  {stage.index}
                </span>
                {!last ? <span aria-hidden="true" className="w-px flex-1 bg-deep-100" /> : null}
              </div>

              {/* Content */}
              <div className={cn('min-w-0 flex-1', last ? 'pb-0' : 'pb-8')}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                  <h3 className="font-display text-lg font-bold text-deep-700 sm:text-xl">
                    {stage.title}
                  </h3>
                  <p className="font-display text-sm font-semibold text-sky-600">{stage.tagline}</p>
                </div>
                <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-deep-500">
                  {stage.body}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
