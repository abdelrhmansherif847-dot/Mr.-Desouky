import { Section, SectionHeading } from '@/components/ui/Section'
import { SystemFlowFull } from '@/components/sections/SystemFlow'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { GlyphMark } from '@/components/brand/MathTexture'
import { FEEDBACK_QUESTIONS, SYSTEM_STAGES } from '@/content/system'
import { LEARNING_LOOP } from '@/content/philosophy'
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'How It Works — The Educational System',
  description:
    'Teaching, session, homework, quiz, review, mock and feedback. The seven-stage educational system behind every SAT and EST Math program, and the purpose of each stage.',
  path: '/how-it-works',
  keywords: ['SAT Math course structure', 'EST Math course', 'Math teaching system'],
})

export default function HowItWorksPage() {
  return (
    <>
      {/* ---------- Page header ---------- */}
      <Section tone="paper" grid containerClassName="pb-10 pt-14 sm:pt-16 lg:pb-14 lg:pt-20">
        <div className="relative">
          <GlyphMark glyph="Σ" className="absolute -right-2 -top-16 text-[12rem] sm:text-[16rem]" />
          <div className="relative">
            <Badge tone="sky">Level 2 · The educational system</Badge>
            <SectionHeading
              as="h1"
              className="mt-5"
              title="Teaching → Session → Homework → Quiz → Review → Mock → Feedback"
              lead="Seven stages, always in this order. Each one has a single job, and each one produces something the next stage needs. Remove any of them and the loop stops closing."
            />

            <ol className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-deep-100 pt-6">
              {LEARNING_LOOP.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-deep-500">
                    {step}
                  </span>
                  {i < LEARNING_LOOP.length - 1 ? (
                    <span aria-hidden="true" className="text-sky-400">→</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ---------- Jump links ---------- */}
      <Section tone="mist" containerClassName="py-8 sm:py-10">
        <nav aria-label="Stages">
          <ul className="flex flex-wrap gap-2">
            {SYSTEM_STAGES.map((stage) => (
              <li key={stage.id}>
                <a
                  href={`#${stage.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-deep-100 bg-white px-4 py-2 text-sm font-medium text-deep-600 transition-colors duration-200 hover:border-sky-300 hover:text-sky-700"
                >
                  <span className="font-mono text-[0.65rem] text-deep-300">{stage.index}</span>
                  {stage.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      {/* ---------- Full system ---------- */}
      <Section tone="paper">
        <SystemFlowFull />
      </Section>

      {/* ---------- Feedback deep-dive ---------- */}
      <Section tone="deep" grid>
        <SectionHeading
          tone="dark"
          eyebrow="The stage that connects everything"
          title="Feedback answers four questions"
          lead="A score on its own changes nothing. Feedback turns a result into a decision — and the same four questions are answered every time, so nothing is left vague."
        />

        <ol className="mt-12 grid gap-4 sm:grid-cols-2">
          {FEEDBACK_QUESTIONS.map((item, i) => (
            <li
              key={item.q}
              className="rounded-card border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-growth-300/40 hover:bg-white/[0.07]"
            >
              <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-growth-300">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-white">{item.q}</h3>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-deep-100/70">{item.a}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-deep-100/60">
          Written feedback follows every quiz and every mock exam. The student receives it directly,
          and the same record is visible to the parent — so nobody has to ask how things are going.
        </p>
      </Section>

      <CtaBand
        eyebrow="See it applied"
        title="The system, applied to a specific exam"
        body="SAT and EST run on the same seven stages — but with their own syllabus, question style, materials and mocks. Compare the four programs to see how it works in practice."
        primary={{ label: 'Explore Programs', href: '/programs' }}
        secondary={{ label: 'The student journey', href: '/journey' }}
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'How It Works', path: '/how-it-works' },
        ])}
      />
    </>
  )
}
