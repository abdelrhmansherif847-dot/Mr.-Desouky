import Link from 'next/link'
import { Section, SectionHeading } from '@/components/ui/Section'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { ArrowRight } from '@/components/ui/Button'
import { GlyphMark } from '@/components/brand/MathTexture'
import { Reveal } from '@/components/motion/Reveal'
import { RESOURCES, RESOURCE_CATEGORIES } from '@/content/resources'
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Resources',
  description:
    'Practice sheets, workbooks, study guides, Math tips, student guides, videos and exam preparation material — built to the same structure as the sessions.',
  path: '/resources',
  keywords: ['SAT Math practice', 'EST Math practice sheets', 'SAT Math workbook'],
})

export default function ResourcesPage() {
  const available = RESOURCES.filter((r) => r.available)
  const planned = RESOURCES.filter((r) => !r.available)

  return (
    <>
      {/* ---------- Header ---------- */}
      <Section tone="paper" grid containerClassName="pb-12 pt-14 sm:pt-16 lg:pb-16 lg:pt-20">
        <Badge tone="olive">Resources</Badge>
        <SectionHeading
          as="h1"
          className="mt-5"
          title="The same system, in print and on screen"
          lead="Every resource here follows the same structure as the sessions — the same order of topics, the same graded difficulty, the same five-step method. Nothing a student picks up should feel like it came from somewhere else."
        />
      </Section>

      {/* ---------- Categories ---------- */}
      <Section tone="mist">
        <SectionHeading eyebrow="What is here" title="Eight kinds of material" />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RESOURCE_CATEGORIES.map((cat, i) => (
            <Reveal
              key={cat.kind}
              index={i}
              variant="scale"
              className="relative overflow-hidden rounded-card border border-deep-100 bg-white p-5 transition-[transform,box-shadow,border-color] duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-card motion-reduce:hover:translate-y-0"
            >
              <GlyphMark
                glyph={['√', 'π', 'Σ', 'x²', '∫', '≠', 'Δ', 'θ'][i]}
                className="absolute -right-2 -top-3 text-6xl"
              />
              <div className="relative">
                <h3 className="font-display text-base font-bold text-deep-700">{cat.kind}</h3>
                <p className="mt-2 text-sm leading-relaxed text-deep-500">{cat.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Available now ---------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="Available now"
          title="Open these straight away"
          lead="More material is published as it is finalised — resources are only listed as available once they actually are."
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {available.map((r, i) => (
            <Reveal as="li" key={r.id} index={i} variant="up">
              <Link
                href={r.href ?? '#'}
                className="group flex h-full flex-col rounded-card border border-deep-100 bg-white p-6 transition-all duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-card"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="sky">{r.kind}</Badge>
                  <Badge tone="neutral">{r.track === 'Both' ? 'SAT & EST' : r.track}</Badge>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-deep-700 group-hover:text-sky-600">
                  {r.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-deep-500">{r.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600">
                  Open
                  <ArrowRight />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ---------- In preparation ---------- */}
      <Section tone="mist">
        <SectionHeading
          eyebrow="In preparation"
          title="Being finalised"
          lead="These are part of the library and are released as each one is completed. Students inside a program receive their program materials directly, regardless of what is published here."
        />

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {planned.map((r, i) => (
            <Reveal
              as="li"
              key={r.id}
              index={i}
              variant="up"
              className="flex h-full flex-col rounded-card border border-dashed border-deep-200 bg-white/60 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{r.kind}</Badge>
                <Badge tone="neutral">{r.track === 'Both' ? 'SAT & EST' : r.track}</Badge>
              </div>
              <h3 className="mt-3.5 font-display text-base font-bold text-deep-600">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-deep-400">{r.description}</p>
              <span className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                Coming soon
              </span>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ---------- Workbook connection ---------- */}
      <Section tone="deep" grid>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHeading
              tone="dark"
              eyebrow="Workbook identity"
              title="One brand, on paper and on screen"
              lead="The printed workbooks and this website are two views of the same system. The same structure, the same difficulty levels, the same visual language — so a student moving between them never has to re-learn how the material is organised."
            />
          </div>

          <div className="lg:col-span-6">
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                { t: 'Structured sections', d: 'Topics appear in the same order everywhere.' },
                { t: 'Difficulty levels', d: 'Foundation → exam level → hard, marked consistently.' },
                { t: 'Practice-focused layouts', d: 'Room to work, because the work is the point.' },
                { t: 'Mathematical visual language', d: 'The same typographic and symbolic detail throughout.' },
              ].map((item) => (
                <li key={item.t} className="rounded-card border border-white/10 bg-white/[0.04] p-5">
                  <h3 className="font-display text-base font-bold text-white">{item.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-deep-100/70">{item.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Beyond the free material"
        title="Program students receive the full library"
        body="Workbooks, practice sets, topic summaries and mock papers are part of every program — issued in the order the syllabus reaches them."
        primary={{ label: 'Explore Programs', href: '/programs' }}
        secondary={{ label: 'Contact Mr. Desouky', href: '/contact' }}
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' },
        ])}
      />
    </>
  )
}
