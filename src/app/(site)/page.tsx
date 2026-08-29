import Link from 'next/link'
import { Hero } from '@/components/sections/Hero'
import { SystemFlowCompact } from '@/components/sections/SystemFlow'
import { MethodStrip } from '@/components/sections/MethodStrip'
import { JourneyPreview } from '@/components/sections/JourneyTimeline'
import { ProgramsGrid } from '@/components/sections/ProgramsGrid'
import { CtaBand } from '@/components/sections/CtaBand'
import { Section, SectionHeading } from '@/components/ui/Section'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { GlyphMark } from '@/components/brand/MathTexture'
import { CORE_BELIEF } from '@/content/philosophy'
import { PARENT_PROMISE } from '@/content/journey'
import { FEEDBACK_QUESTIONS } from '@/content/system'
import { RESOURCE_CATEGORIES } from '@/content/resources'
import { JsonLd, faqJsonLd } from '@/lib/seo'
import { FAQS } from '@/content/faq'

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ---------- Core belief ---------- */}
      <Section tone="paper" containerClassName="py-14 sm:py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-panel border border-deep-100 bg-mist px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
          <GlyphMark glyph="√" className="absolute -right-4 -top-6 text-[10rem] sm:text-[14rem]" />
          <div className="relative max-w-3xl">
            <p className="eyebrow text-sky-600">The belief behind the system</p>
            <blockquote className="mt-4">
              <p className="font-display text-display-sm text-deep-700">
                &ldquo;{CORE_BELIEF.statement}&rdquo;
              </p>
            </blockquote>
            <p className="mt-5 text-base leading-relaxed text-deep-500 sm:text-lg">
              {CORE_BELIEF.expansion}
            </p>
            <Link
              href="/about"
              className="group mt-7 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              Read the philosophy
              <ArrowRight />
            </Link>
          </div>
        </div>
      </Section>

      <SystemFlowCompact />

      {/* ---------- Programs ---------- */}
      <Section tone="paper" id="programs">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Programs"
            title="Two exams. Two levels. Never mixed."
            lead="SAT and EST are different exams with different syllabi, wording and timing — so they are taught as completely separate programs. Within each, the level is decided by a diagnostic, not by preference."
          />
          <ButtonLink href="/programs" variant="secondary" className="group shrink-0 self-start lg:self-auto">
            Compare all programs
            <ArrowRight />
          </ButtonLink>
        </div>

        <div className="mt-12">
          <ProgramsGrid />
        </div>
      </Section>

      <MethodStrip />

      <JourneyPreview />

      {/* ---------- Feedback / parent visibility ---------- */}
      <Section tone="mist" id="feedback">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Feedback & visibility"
              title="Four questions, answered every time"
              lead="Feedback here is not a comment written at the bottom of a paper. It is a short, direct answer to the same four questions after every quiz and every mock — given to the student, and visible to the parent."
            />
            <ButtonLink href="/login/parent" variant="secondary" className="group mt-8">
              See the parent portal
              <ArrowRight />
            </ButtonLink>
          </div>

          <div className="lg:col-span-7">
            <ol className="grid gap-3 sm:grid-cols-2">
              {FEEDBACK_QUESTIONS.map((item, i) => (
                <li
                  key={item.q}
                  className="rounded-card border border-deep-100 bg-white p-5 sm:p-6"
                >
                  <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-growth-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 font-display text-base font-bold text-deep-700">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-deep-500">{item.a}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-card border border-deep-100 bg-white p-5 sm:p-6">
              <p className="font-display text-sm font-semibold text-deep-700">
                {PARENT_PROMISE.lead}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {PARENT_PROMISE.items.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-deep-600"
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- Resources teaser ---------- */}
      <Section tone="paper" id="resources">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Resources"
            title="The same system, in print and on screen"
            lead="Practice sheets, workbooks, study guides and student guides — built to the same structure as the sessions, so nothing a student uses feels like it came from somewhere else."
          />
          <ButtonLink href="/resources" variant="secondary" className="group shrink-0 self-start lg:self-auto">
            Browse resources
            <ArrowRight />
          </ButtonLink>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RESOURCE_CATEGORIES.slice(0, 4).map((cat) => (
            <li
              key={cat.kind}
              className="rounded-card border border-deep-100 bg-white p-5 transition-all duration-300 ease-calm hover:-translate-y-1 hover:shadow-card"
            >
              <h3 className="font-display text-base font-bold text-deep-700">{cat.kind}</h3>
              <p className="mt-2 text-sm leading-relaxed text-deep-500">{cat.blurb}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand whatsapp />

      <JsonLd data={faqJsonLd(FAQS.slice(0, 6))} />
    </>
  )
}
