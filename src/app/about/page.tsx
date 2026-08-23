import { Section, SectionHeading } from '@/components/ui/Section'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { Portrait } from '@/components/brand/Portrait'
import { GlyphMark } from '@/components/brand/MathTexture'
import { Reveal } from '@/components/motion/Reveal'
import {
  APPROACH_MARKERS,
  INTRO,
  OPTIONAL_CREDENTIALS,
  TEACHING_COMMITMENTS,
} from '@/content/about'
import {
  CORE_BELIEF,
  MISSION,
  PRINCIPLES,
  SUCCESS_DEFINITION,
  VALUES,
  VISION,
} from '@/content/philosophy'
import { SITE } from '@/content/site'
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'About Eng. Abdelrhman Desouky',
  description:
    'The person, the philosophy and the principles behind the system — vision, mission, values and what success actually means in SAT and EST Math preparation.',
  path: '/about',
  keywords: ['SAT Math teacher Egypt', 'EST Math teacher', 'Math instructor'],
})

export default function AboutPage() {
  return (
    <>
      {/* ---------- Intro ---------- */}
      <Section tone="paper" grid containerClassName="pb-12 pt-14 sm:pt-16 lg:pb-20 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Badge tone="sky">{INTRO.eyebrow}</Badge>
            <h1 className="mt-5 text-display-lg text-deep-700">{INTRO.title}</h1>
            <p className="mt-5 font-display text-lg font-semibold text-sky-600 sm:text-xl">
              {INTRO.lead}
            </p>

            <div className="mt-8 max-w-prose space-y-5">
              {INTRO.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="text-[1.02rem] leading-relaxed text-deep-600">
                  {p}
                </p>
              ))}
            </div>

            {OPTIONAL_CREDENTIALS.length > 0 ? (
              <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-deep-100 pt-8 sm:grid-cols-4">
                {OPTIONAL_CREDENTIALS.map((c) => (
                  <div key={c.label}>
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                      {c.label}
                    </dt>
                    <dd className="mt-1.5 font-display text-lg font-bold text-deep-700">{c.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          {/* Approved portrait placement */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="mx-auto max-w-sm lg:max-w-none">
                <Portrait treatment="frame" priority sizes="(min-width: 1024px) 26rem, 80vw" />
              </div>

              <div className="mt-10 rounded-card border border-deep-100 bg-mist p-5 sm:p-6">
                <p className="eyebrow text-sky-600">The system in brief</p>
                <ul className="mt-4 space-y-3.5">
                  {APPROACH_MARKERS.map((m) => (
                    <li key={m.label}>
                      <p className="font-display text-sm font-bold text-deep-700">{m.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-deep-500">{m.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- Core belief ---------- */}
      <Section tone="deep" grid containerClassName="py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl text-center">
          <GlyphMark
            glyph="π"
            tone="dark"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] sm:text-[22rem]"
          />
          <blockquote className="relative">
            <p className="eyebrow text-sky-300">The belief behind everything</p>
            <p className="mt-5 font-display text-display-sm text-white">
              &ldquo;{CORE_BELIEF.statement}&rdquo;
            </p>
            <footer className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-deep-100/50">
              {SITE.name}
            </footer>
          </blockquote>
        </div>
      </Section>

      {/* ---------- Vision & mission ---------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="Level 1 · Philosophy"
          title="Vision, mission and what they mean in practice"
          lead="Not statements written for a brochure — the two sentences the whole system is built to deliver on."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-6">
          {[VISION, MISSION].map((item, i) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-panel border border-deep-100 bg-white p-6 sm:p-8 lg:p-10"
            >
              <GlyphMark glyph={i === 0 ? '∞' : 'Σ'} className="absolute -right-2 -top-4 text-8xl" />
              <div className="relative">
                <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-sky-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-deep-700">{item.title}</h3>
                <p className="mt-4 text-[1rem] leading-relaxed text-deep-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- Values ---------- */}
      <Section tone="mist">
        <SectionHeading
          eyebrow="Values"
          title="What is not negotiable"
          lead="These decide the small daily choices — how a weak result is reported, how a question is answered, what happens when a student falls behind."
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value, i) => (
            <Reveal
              key={value.title}
              index={i}
              variant="up"
              className="rounded-card border border-deep-100 bg-white p-6 transition-[transform,box-shadow,border-color] duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-card motion-reduce:hover:translate-y-0"
            >
              <h3 className="font-display text-lg font-bold text-deep-700">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-deep-500">{value.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Principles ---------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="Principles"
          title="Six rules the system runs on"
          lead="Every one of them exists because ignoring it produced a predictable problem."
        />

        <ol className="mt-12 grid gap-x-10 gap-y-8 lg:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal as="li" key={p.number} index={i} variant="up" className="flex gap-5 border-t border-deep-100 pt-6">
              <span className="font-mono text-2xl font-bold text-sky-500">{p.number}</span>
              <div>
                <h3 className="font-display text-lg font-bold text-deep-700">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-deep-500">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* ---------- Commitments ---------- */}
      <Section tone="mist">
        <SectionHeading
          eyebrow="Commitments"
          title="Four things that do not change"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {TEACHING_COMMITMENTS.map((c) => (
            <div key={c.title} className="rounded-card border border-deep-100 bg-white p-6 sm:p-7">
              <h3 className="font-display text-lg font-bold text-deep-700">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-deep-500">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- Definition of success ---------- */}
      <Section tone="paper">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Definition of success"
              title={SUCCESS_DEFINITION.title}
              lead={SUCCESS_DEFINITION.lead}
            />
            <p className="mt-6 max-w-prose text-[1rem] leading-relaxed text-deep-600">
              {SUCCESS_DEFINITION.body}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-panel border border-deep-100 bg-mist p-6 sm:p-8">
              <p className="eyebrow text-growth-600">What it looks like</p>
              <ul className="mt-5 space-y-4">
                {SUCCESS_DEFINITION.markers.map((m) => (
                  <li key={m} className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 16 16"
                      className="mt-0.5 h-4 w-4 shrink-0 text-growth-500"
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
                    <span className="text-[0.95rem] leading-relaxed text-deep-600">{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red = pay attention. Used once, deliberately. */}
            <div className="mt-4 flex items-start gap-3 rounded-card border border-alert-100 bg-alert-50/60 p-5">
              <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-alert-500" aria-hidden="true">
                <path
                  d="M8 5v4m0 2.5h.01M8 1.5 14.5 13.5h-13L8 1.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm leading-relaxed text-alert-800">
                {SUCCESS_DEFINITION.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Get started"
        title="See how the system would apply to your student"
        body="The first step is the same for everyone: a diagnostic assessment that shows exactly where the student stands today."
        primary={{ label: 'Explore Programs', href: '/programs' }}
        whatsapp
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
    </>
  )
}
