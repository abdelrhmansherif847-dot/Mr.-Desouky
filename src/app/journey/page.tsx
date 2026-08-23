import { Section, SectionHeading } from '@/components/ui/Section'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { JOURNEY_STAGES } from '@/content/journey'
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const metadata = pageMeta({
  title: 'The Student Journey',
  description:
    'Seven stages from the first assessment to exam day: assessment, foundation, practice, analysis, advanced training, mock exams and final preparation.',
  path: '/journey',
  keywords: ['SAT Math preparation plan', 'EST Math study plan', 'student progress'],
})

const ORIENTATION = [
  { q: 'Where am I?', a: 'The current stage is always named, and the last measured result is always visible.' },
  { q: 'What am I doing?', a: 'The topics, homework and quizzes for this stage — nothing further ahead.' },
  { q: 'Why am I doing it?', a: 'Each stage has one stated purpose, and the student is told what it is.' },
  { q: 'What comes next?', a: 'The next stage, and the specific condition for reaching it.' },
]

export default function JourneyPage() {
  return (
    <>
      {/* ---------- Header ---------- */}
      <Section tone="paper" grid containerClassName="pb-12 pt-14 sm:pt-16 lg:pb-16 lg:pt-20">
        <Badge tone="growth">Level 3 · Student success</Badge>
        <SectionHeading
          as="h1"
          className="mt-5"
          title="From where the student is, to exam ready"
          lead="A program is not a set of lessons that happen to be in order. It is a sequence with a defined starting point, a defined end point, and a reason for every stage in between."
        />

        {/* Progress rail — visual anchor for the whole page */}
        <div className="mt-12 hidden lg:block">
          <ol className="relative flex items-start justify-between">
            <span aria-hidden="true" className="absolute left-0 right-0 top-5 h-px bg-deep-100" />
            {JOURNEY_STAGES.map((stage) => (
              <li key={stage.id} className="relative flex w-[13%] flex-col items-center text-center">
                <a
                  href={`#${stage.id}`}
                  className="group flex flex-col items-center"
                  aria-label={`${stage.index} ${stage.title}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-deep-100 bg-white font-mono text-xs font-bold text-deep-400 transition-colors duration-300 group-hover:border-sky-400 group-hover:text-sky-600">
                    {stage.index}
                  </span>
                  <span className="mt-3 font-display text-[0.82rem] font-semibold leading-tight text-deep-600 transition-colors duration-300 group-hover:text-sky-600">
                    {stage.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ---------- Stages ---------- */}
      <Section tone="mist">
        <div className="space-y-5">
          {JOURNEY_STAGES.map((stage, i) => {
            const last = i === JOURNEY_STAGES.length - 1
            return (
              <div key={stage.id} id={stage.id} className="scroll-mt-28">
                <article className="overflow-hidden rounded-panel border border-deep-100 bg-white">
                  <div className="grid lg:grid-cols-12">
                    <div className="border-b border-deep-100 p-6 sm:p-8 lg:col-span-4 lg:border-b-0 lg:border-r">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-2xl font-bold text-sky-500">{stage.index}</span>
                        <h2 className="font-display text-2xl font-bold text-deep-700">{stage.title}</h2>
                      </div>
                      <p className="mt-3 font-display text-base font-semibold text-deep-500">
                        {stage.tagline}
                      </p>

                      {/* Position marker */}
                      <div className="mt-6">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-deep-100">
                          <div
                            className={cn('h-full rounded-full bg-growth-300')}
                            style={{ width: `${Math.max(8, stage.position)}%` }}
                          />
                        </div>
                        <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                          Stage {i + 1} of {JOURNEY_STAGES.length}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:col-span-8 lg:p-10">
                      <p className="max-w-2xl text-[1rem] leading-relaxed text-deep-600">{stage.body}</p>

                      <dl className="mt-7 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-card bg-mist p-4">
                          <dt className="eyebrow text-sky-600">The student sees</dt>
                          <dd className="mt-2 text-sm leading-relaxed text-deep-600">
                            {stage.studentSees}
                          </dd>
                        </div>
                        <div className="rounded-card bg-growth-50 p-4">
                          <dt className="eyebrow text-growth-600">Outcome</dt>
                          <dd className="mt-2 text-sm leading-relaxed text-deep-600">{stage.outcome}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </article>

                {!last ? (
                  <div aria-hidden="true" className="flex justify-center py-2">
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
      </Section>

      {/* ---------- Orientation ---------- */}
      <Section tone="deep" grid>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              tone="dark"
              eyebrow="Orientation"
              title="A student should never be lost inside their own program"
              lead="At any point in the journey, four questions have an answer. If a student cannot answer them, the plan is not being communicated well enough — and that is a teaching problem, not a student problem."
            />
            <ButtonLink href="/login/student" variant="onDark" className="group mt-8">
              See the student dashboard
              <ArrowRight />
            </ButtonLink>
          </div>

          <div className="lg:col-span-7">
            <ol className="grid gap-3 sm:grid-cols-2">
              {ORIENTATION.map((item, i) => (
                <li key={item.q} className="rounded-card border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-sky-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2.5 font-display text-lg font-bold text-white">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-deep-100/70">{item.a}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Stage 01"
        title="It starts with an assessment"
        body="The first stage is finding out honestly where the student stands. Everything after it — the level, the plan, the pace — follows from that result."
        primary={{ label: 'Explore Programs', href: '/programs' }}
        whatsapp
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Student Journey', path: '/journey' },
        ])}
      />
    </>
  )
}
