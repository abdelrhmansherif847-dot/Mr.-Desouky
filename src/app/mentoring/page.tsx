import { Section, SectionHeading } from '@/components/ui/Section'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { Portrait } from '@/components/brand/Portrait'
import { ADVISING, MENTORING, PARENT_PROMISE } from '@/content/journey'
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Mentoring & Advising',
  description:
    'Following each student’s progress and helping families choose the right exam, the right level and the right timeline — with honest advice rather than upselling.',
  path: '/mentoring',
  keywords: ['SAT Math mentoring', 'EST Math advising', 'choosing SAT level'],
})

export default function MentoringPage() {
  return (
    <>
      {/* ---------- Header ---------- */}
      <Section tone="paper" grid containerClassName="pb-12 pt-14 sm:pt-16 lg:pb-16 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Badge tone="growth">Level 3 · Student success</Badge>
            <h1 className="mt-5 text-display-lg text-deep-700">
              A teacher is not only someone who explains
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-deep-500 sm:text-lg">
              Teaching is the visible half of the work. The other half is watching what happens
              afterwards — whether the plan is working, whether the student is still with it, and
              whether the decisions being made about their preparation are the right ones. That is
              what mentoring and advising cover.
            </p>
          </div>

          {/* Mentoring is an approved portrait placement */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-xs lg:max-w-none">
              <Portrait treatment="frame" priority sizes="(min-width: 1024px) 24rem, 60vw" />
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- Mentoring ---------- */}
      <Section tone="mist" id="mentoring">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Mentoring" title={MENTORING.lead} />
            <p className="mt-6 max-w-prose text-[1rem] leading-relaxed text-deep-600">
              {MENTORING.body}
            </p>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-3 sm:grid-cols-2">
              {MENTORING.points.map((point) => (
                <li key={point.title} className="rounded-card border border-deep-100 bg-white p-5 sm:p-6">
                  <h3 className="font-display text-base font-bold text-deep-700">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-deep-500">{point.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------- Advising ---------- */}
      <Section tone="paper" id="advising">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Advising" title={ADVISING.lead} />
            <p className="mt-6 max-w-prose text-[1rem] leading-relaxed text-deep-600">
              {ADVISING.body}
            </p>
          </div>

          <div className="lg:col-span-7">
            <ol className="space-y-3">
              {ADVISING.points.map((point, i) => (
                <li
                  key={point.title}
                  className="flex items-start gap-4 rounded-card border border-deep-100 bg-white p-5 sm:p-6"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 font-mono text-xs font-bold text-sky-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-deep-700">{point.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-deep-500">{point.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ---------- Parent visibility ---------- */}
      <Section tone="deep" grid id="parents">
        <SectionHeading
          tone="dark"
          eyebrow="For parents"
          title={PARENT_PROMISE.lead}
          lead={PARENT_PROMISE.body}
        />

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PARENT_PROMISE.items.map((item) => (
            <li
              key={item.title}
              className="rounded-card border border-white/10 bg-white/[0.04] p-5 transition-colors duration-300 hover:border-growth-300/40 hover:bg-white/[0.08]"
            >
              <h3 className="font-display text-base font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-deep-100/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        eyebrow="Talk it through"
        title="Not sure which exam or which level?"
        body="That is exactly what advising is for. A short conversation and a diagnostic assessment will answer it properly — including if the honest answer is that a student should wait."
        primary={{ label: 'Contact Mr. Desouky', href: '/contact' }}
        whatsapp
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Mentoring & Advising', path: '/mentoring' },
        ])}
      />
    </>
  )
}
