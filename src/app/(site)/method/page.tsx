import { Section, SectionHeading } from '@/components/ui/Section'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { GlyphMark } from '@/components/brand/MathTexture'
import { Reveal } from '@/components/motion/Reveal'
import { METHOD_STEPS, METHOD_SUMMARY } from '@/content/method'
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'The Desouky Method',
  description:
    'READ · ANALYZE · PLAN · SOLVE · CHECK — the five-step routine used on every SAT and EST Math question, built to hold up under exam pressure.',
  path: '/method',
  keywords: ['SAT Math method', 'how to solve SAT Math questions', 'EST Math strategy'],
})

export default function MethodPage() {
  return (
    <>
      {/* ---------- Header ---------- */}
      <Section tone="deep" grid containerClassName="py-16 sm:py-20 lg:py-24">
        <div className="relative">
          <GlyphMark
            glyph="√"
            tone="dark"
            className="absolute -right-4 -top-20 text-[14rem] sm:text-[20rem]"
          />
          <div className="relative max-w-3xl">
            <Badge tone="sky" className="!bg-white/10 !text-sky-200 !ring-white/20">
              Signature methodology
            </Badge>
            <h1 className="mt-5 text-display-lg text-white">The Desouky Method</h1>
            <p className="mt-5 font-display text-xl font-semibold text-sky-300 sm:text-2xl">
              {METHOD_SUMMARY.lead}
            </p>
            <p className="mt-5 text-base leading-relaxed text-deep-100/75 sm:text-lg">
              {METHOD_SUMMARY.body}
            </p>
          </div>

          {/* Step rail */}
          <ol className="relative mt-12 flex flex-wrap items-center gap-x-2 gap-y-3 border-t border-white/10 pt-8">
            {METHOD_STEPS.map((step, i) => (
              <li key={step.id} className="flex items-center gap-2">
                <a
                  href={`#${step.id}`}
                  className="rounded-full border border-white/15 px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors duration-200 hover:border-sky-300/60 hover:bg-white/10"
                >
                  {step.title}
                </a>
                {i < METHOD_STEPS.length - 1 ? (
                  <span aria-hidden="true" className="text-sky-400/70">→</span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ---------- The five steps ---------- */}
      <Section tone="paper">
        <div className="space-y-6 lg:space-y-8">
          {METHOD_STEPS.map((step) => (
            <Reveal
              as="article"
              key={step.id}
              id={step.id}
              variant="up"
              className="scroll-mt-28 overflow-hidden rounded-panel border border-deep-100 bg-white"
            >
              <div className="grid lg:grid-cols-12">
                {/* Left — index & symbol */}
                <div className="relative flex items-center gap-5 overflow-hidden bg-mist p-6 sm:p-8 lg:col-span-4 lg:flex-col lg:items-start lg:justify-center lg:gap-3">
                  <GlyphMark
                    glyph={step.symbol}
                    className="absolute -bottom-6 -right-2 text-[7rem] sm:text-[9rem]"
                  />
                  <span className="relative font-mono text-sm font-bold tracking-[0.18em] text-sky-600">
                    {step.index}
                  </span>
                  <div className="relative">
                    <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-deep-700 sm:text-4xl">
                      {step.title}
                    </h2>
                    <p className="mt-2 font-display text-base font-semibold text-deep-500">
                      {step.tagline}
                    </p>
                  </div>
                </div>

                {/* Right — detail */}
                <div className="p-6 sm:p-8 lg:col-span-8 lg:p-10">
                  <p className="max-w-2xl text-[1.02rem] leading-relaxed text-deep-600">
                    {step.body}
                  </p>

                  <div className="mt-7 grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="eyebrow text-deep-400">In practice</h3>
                      <ul className="mt-3 space-y-2.5">
                        {step.inPractice.map((p) => (
                          <li key={p} className="flex items-start gap-2.5 text-sm leading-snug text-deep-600">
                            <svg
                              viewBox="0 0 16 16"
                              className="mt-0.5 h-4 w-4 shrink-0 text-growth-400"
                              aria-hidden="true"
                            >
                              <path
                                d="M3.5 8.5 6.5 11.5 12.5 5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Red used exactly as intended: pay attention. */}
                    <div className="rounded-card border border-alert-100 bg-alert-50/60 p-4">
                      <h3 className="eyebrow flex items-center gap-2 text-alert-600">
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                          <path
                            d="M8 5v4m0 2.5h.01M8 1.5 14.5 13.5h-13L8 1.5Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Common mistake
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-alert-800">{step.mistake}</p>
                    </div>
                  </div>
                </div>
              </div>

            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Why it works ---------- */}
      <Section tone="mist">
        <SectionHeading
          eyebrow="Why it works"
          title="Under pressure, students fall back on habits"
          lead="Nobody rises to the occasion in an exam hall. Whatever routine has been practised a thousand times is the routine that shows up — so it is worth choosing that routine deliberately."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {METHOD_SUMMARY.why.map((item) => (
            <div key={item.title} className="rounded-card border border-deep-100 bg-white p-6 sm:p-7">
              <h3 className="font-display text-lg font-bold text-deep-700">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-deep-500">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        eyebrow="Put it to work"
        title="The method is taught inside every program"
        body="It is not an optional extra or a single lesson. Every session, every homework set and every mock review uses the same five steps until they stop needing to be remembered."
        primary={{ label: 'Explore Programs', href: '/programs' }}
        secondary={{ label: 'How the system works', href: '/how-it-works' }}
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'The Desouky Method', path: '/method' },
        ])}
      />
    </>
  )
}
