import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section, SectionHeading } from '@/components/ui/Section'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { Portrait } from '@/components/brand/Portrait'
import { GlyphMark } from '@/components/brand/MathTexture'
import { Reveal } from '@/components/motion/Reveal'
import { PROGRAMS, getProgram } from '@/content/programs'
import { SYSTEM_STAGES } from '@/content/system'
import { JsonLd, breadcrumbJsonLd, courseJsonLd, pageMeta } from '@/lib/seo'
import { whatsappLink } from '@/content/site'

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = getProgram(slug)
  if (!program) return {}

  return pageMeta({
    title: program.title,
    description: program.summary.slice(0, 175),
    path: `/programs/${program.slug}`,
    keywords: [
      `${program.exam} Math`,
      `${program.exam} Math ${program.level}`,
      `${program.exam} Math course`,
      `${program.exam} Math Egypt`,
    ],
  })
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = getProgram(slug)
  if (!program) notFound()

  const sibling = PROGRAMS.find((p) => p.exam === program.exam && p.slug !== program.slug)
  const otherTrack = PROGRAMS.filter((p) => p.exam !== program.exam && p.level === program.level)[0]
  const isSat = program.exam === 'SAT'

  const facts = [
    { label: 'Exam', value: `${program.exam} Math` },
    { label: 'Level', value: program.level },
    { label: 'Duration', value: program.duration },
    { label: 'Sessions', value: program.sessions },
    { label: 'Session length', value: program.sessionLength },
    { label: 'Format', value: program.groupSize },
  ]

  return (
    <>
      {/* ---------- Header ---------- */}
      <Section tone="paper" grid containerClassName="pb-12 pt-10 sm:pt-14 lg:pb-16 lg:pt-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-deep-400">
            <li>
              <Link href="/" className="hover:text-sky-600">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/programs" className="hover:text-sky-600">Programs</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-deep-600">{program.title}</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isSat ? 'sky' : 'olive'}>{program.exam} Math</Badge>
              <Badge tone={program.level === 'Advanced' ? 'deep' : 'neutral'}>{program.level}</Badge>
            </div>

            <h1 className="mt-5 text-display-lg text-deep-700">{program.title}</h1>
            <p className="mt-4 font-display text-lg font-semibold text-sky-600 sm:text-xl">
              {program.tagline}
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-deep-500 sm:text-lg">
              {program.summary}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" size="lg" className="group w-full sm:w-auto">
                Register interest
                <ArrowRight />
              </ButtonLink>
              <ButtonLink
                href={whatsappLink(
                  `Hello Mr. Desouky, I would like to ask about the ${program.title} program.`,
                )}
                external
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Ask on WhatsApp
              </ButtonLink>
            </div>
          </div>

          {/* Course introduction — one of the approved portrait placements */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-xs lg:max-w-none">
              <Portrait treatment="frame" sizes="(min-width: 1024px) 24rem, 60vw" />
              <p className="mt-8 text-sm leading-relaxed text-deep-400">
                Taught personally by Eng. Abdelrhman Desouky, using the same seven-stage system
                across every program.
              </p>
            </div>
          </div>
        </div>

        {/* Facts strip */}
        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-deep-100 bg-deep-100 sm:grid-cols-3 lg:grid-cols-6">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-white p-4 sm:p-5">
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                {fact.label}
              </dt>
              <dd className="mt-1.5 font-display text-sm font-bold leading-snug text-deep-700">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ---------- Who it is for ---------- */}
      <Section tone="mist">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Who it is for"
              title="Is this the right level?"
              lead="The diagnostic assessment gives the definitive answer — but these are the students this program is built for."
            />
            <div className="mt-8 rounded-card border border-sky-100 bg-sky-50/60 p-5">
              <p className="eyebrow text-sky-700">Entry</p>
              <p className="mt-2 text-sm leading-relaxed text-deep-600">{program.entryRequirement}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-3 sm:grid-cols-2">
              {program.forWho.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-card border border-deep-100 bg-white p-5"
                >
                  <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-growth-400" aria-hidden="true">
                    <path
                      d="M3.5 8.5 6.5 11.5 12.5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm leading-relaxed text-deep-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------- What students learn ---------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="What students learn"
          title={`The ${program.exam} Math syllabus, taught in order`}
          lead="Topics are taught in a deliberate sequence — each one builds on the last, and nothing advanced is attempted before its foundation is secure."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-6">
          {program.learn.map((group, i) => (
            <Reveal
              key={group.area}
              index={i}
              variant="up"
              className="relative overflow-hidden rounded-panel border border-deep-100 bg-white p-6 sm:p-7"
            >
              <GlyphMark
                glyph={['√', 'π', 'Σ', 'x²', '∫'][i % 5]}
                className="absolute -right-3 -top-4 text-7xl"
              />
              <div className="relative">
                <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-sky-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-deep-700">{group.area}</h3>
                <ul className="mt-4 space-y-2">
                  {group.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2.5 text-sm leading-relaxed text-deep-500">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-deep-300" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- What's included ---------- */}
      <Section tone="deep" grid>
        <SectionHeading
          tone="dark"
          eyebrow="What is included"
          title="The full system, applied to this program"
          lead="Every stage of the educational system runs inside this program. Nothing is an optional add-on."
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {program.included.map((item, i) => {
            const stage = SYSTEM_STAGES.find(
              (s) => s.title.toLowerCase() === item.label.toLowerCase().replace(' exams', ''),
            )
            return (
              <Reveal
                key={item.label}
                index={i}
                variant="up"
                className="rounded-card border border-white/10 bg-white/[0.04] p-5 transition-[transform,background-color,border-color] duration-300 ease-calm hover:-translate-y-1 hover:border-sky-300/40 hover:bg-white/[0.08] motion-reduce:hover:translate-y-0"
              >
                {stage ? (
                  <span className="font-mono text-[0.62rem] font-semibold tracking-[0.16em] text-sky-300">
                    {stage.index}
                  </span>
                ) : (
                  <span className="font-mono text-[0.62rem] font-semibold tracking-[0.16em] text-growth-300">
                    +
                  </span>
                )}
                <h3 className="mt-2 font-display text-base font-bold text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-deep-100/70">{item.detail}</p>
              </Reveal>
            )
          })}
        </div>

        <Link
          href="/how-it-works"
          className="group mt-10 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-300 hover:text-sky-200"
        >
          How each stage works
          <ArrowRight />
        </Link>
      </Section>

      {/* ---------- Outcome ---------- */}
      <Section tone="mist">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Expected learning outcome"
              title="What a student should be able to do at the end"
            />
            <p className="mt-6 rounded-card border border-deep-100 bg-white p-5 text-sm leading-relaxed text-deep-500">
              These are learning outcomes, not score promises. No specific score is guaranteed —
              what is committed to is the process, the measurement and the feedback behind it.
            </p>
          </div>

          <div className="lg:col-span-7">
            <ul className="space-y-3">
              {program.outcome.map((item, i) => (
                <Reveal
                  as="li"
                  key={item}
                  index={i}
                  variant="up"
                  className="flex items-start gap-4 rounded-card border border-deep-100 bg-white p-5 sm:p-6"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-growth-50 font-mono text-xs font-bold text-growth-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[0.95rem] leading-relaxed text-deep-600">{item}</span>
                </Reveal>
              ))}
            </ul>

            {program.nextStep ? (
              <Link
                href={program.nextStep.href}
                className="group mt-6 flex items-center justify-between gap-4 rounded-card border border-sky-200 bg-sky-50/60 p-5 transition-colors duration-300 hover:bg-sky-50 sm:p-6"
              >
                <span>
                  <span className="eyebrow block text-sky-600">Then continue to</span>
                  <span className="mt-1.5 block font-display text-lg font-bold text-deep-700">
                    {program.nextStep.label}
                  </span>
                </span>
                <span className="text-sky-600">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </Section>

      {/* ---------- Related programs ---------- */}
      <Section tone="paper" containerClassName="py-14 sm:py-16">
        <h2 className="font-display text-xl font-bold text-deep-700">Other programs</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[sibling, otherTrack].filter(Boolean).map((p) => (
            <Link
              key={p!.slug}
              href={`/programs/${p!.slug}`}
              className="group rounded-card border border-deep-100 bg-white p-5 transition-all duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-card sm:p-6"
            >
              <div className="flex items-center gap-2">
                <Badge tone={p!.exam === 'SAT' ? 'sky' : 'olive'}>{p!.exam}</Badge>
                <Badge tone="neutral">{p!.level}</Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-deep-700 group-hover:text-sky-600">
                {p!.title}
              </h3>
              <p className="mt-1.5 text-sm text-deep-500">{p!.tagline}</p>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand
        eyebrow="Register"
        title={`Start ${program.title} with an assessment`}
        body="The diagnostic confirms whether this is the right program and the right level. Message on WhatsApp or send the contact form to arrange it."
        primary={{ label: 'Contact Mr. Desouky', href: '/contact' }}
        whatsapp
      />

      <JsonLd
        data={[
          courseJsonLd(program),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Programs', path: '/programs' },
            { name: program.title, path: `/programs/${program.slug}` },
          ]),
        ]}
      />
    </>
  )
}
