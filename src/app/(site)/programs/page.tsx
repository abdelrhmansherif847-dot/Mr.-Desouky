import Link from 'next/link'
import { Section, SectionHeading } from '@/components/ui/Section'
import { ProgramsGrid } from '@/components/sections/ProgramsGrid'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { ArrowRight } from '@/components/ui/Button'
import { COURSES } from '@/content/curriculum'
import { EXAM_TONE, TARGET_LABEL, lessonLength, quizCount, teachingTime } from '@/lib/courses/present'
import { FAQS } from '@/content/faq'
import { JsonLd, breadcrumbJsonLd, faqJsonLd, pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Programs — SAT, EST and ACT Math',
  description:
    'Six courses: SAT, EST and ACT Math, each at Basic (Grade 10) and Advanced (Grade 11–12) level. 24 lessons each, with homework after every lesson, quizzes and timed mock exams.',
  path: '/programs',
  keywords: [
    'SAT Math course',
    'SAT Math Egypt',
    'EST Math course',
    'EST Math Egypt',
    'SAT Math basics',
    'SAT Math advanced',
    'ACT Math course',
    'ACT Math Egypt',
    'EST I Math',
  ],
})

/** Every row is read from the curriculum model; nothing is typed in twice. */
const COMPARE_ROWS: { label: string; value: (c: (typeof COURSES)[number]) => string }[] = [
  { label: 'Grade', value: (c) => c.grade },
  { label: 'Prepares for', value: (c) => TARGET_LABEL[c.target] },
  { label: 'Lessons', value: (c) => `${c.lessons.length}, of ${lessonLength(c)}` },
  { label: 'Teaching time', value: (c) => teachingTime(c) },
  { label: 'Homework', value: (c) => c.delivery.homework },
  { label: 'Quizzes', value: (c) => `${quizCount(c)}, ${c.delivery.quizzes.when.toLowerCase()}` },
  { label: 'Mock exams', value: (c) => `${c.delivery.mocks.count} (${c.delivery.mocks.format})` },
  { label: 'Tracking', value: (c) => c.delivery.tracking },
  { label: 'Fees', value: () => 'On request' },
]

/** What every course of one level has in common, read from those courses. */
function levelFacts(level: 'Basic' | 'Advanced'): string[] {
  const courses = COURSES.filter((c) => c.level === level)
  const c = courses[0]
  const facts = [
    c.grade,
    `${c.lessons.length} lessons of ${lessonLength(c)}, taught in order`,
    `Homework ${c.delivery.homework.toLowerCase()}, ${quizCount(c)} quizzes and ${c.delivery.mocks.count} timed mock exams`,
  ]
  if (level === 'Basic') facts.push('Leads on to the Advanced course for the same exam')
  if (level === 'Advanced' && courses.every((x) => x.assessment.mockLessons.includes(x.lessons.length))) {
    facts.push(`Lesson ${c.lessons.length} is a timed mock exam`)
  }
  return facts
}

export default function ProgramsPage() {
  return (
    <>
      {/* ---------- Header ---------- */}
      <Section tone="paper" grid containerClassName="pb-12 pt-14 sm:pt-16 lg:pb-16 lg:pt-20">
        <Badge tone="sky">Programs</Badge>
        <SectionHeading
          as="h1"
          className="mt-5"
          title="Three exams. Two levels. Never mixed."
          lead="The SAT, the EST and the ACT are different exams, so each is taught as its own course, with its own curriculum, homework, quizzes and mock exams. Every exam has a Basic course for Grade 10 and an Advanced course for Grade 11–12, 24 lessons each. Within each exam, the diagnostic assessment decides the level rather than preference."
        />
      </Section>

      {/* ---------- The three exams ---------- */}
      <Section tone="mist">
        <SectionHeading
          eyebrow="Step one"
          title="Choose the exam, then the level"
          lead="Each exam below has its own two courses. Open one to see its 24 lessons in order, its assessment plan and how to enrol."
        />
        <div className="mt-12">
          <ProgramsGrid />
        </div>
      </Section>

      {/* ---------- Basic vs Advanced ---------- */}
      <Section tone="paper">
        <SectionHeading
          eyebrow="Choosing a level"
          title="Basic or Advanced is a diagnostic decision"
          lead="Not a preference, and not a matter of confidence. The assessment shows topic by topic what is already secure, and the level follows from that. Starting one level too high is the most common way a preparation year is wasted."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-6">
          <div className="rounded-panel border border-deep-100 bg-white p-6 sm:p-8">
            <Badge tone="neutral">Basic</Badge>
            <h3 className="mt-4 font-display text-xl font-bold text-deep-700">
              Build the foundation the whole section rests on
            </h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-deep-500">
              For students whose diagnostic shows gaps in core skills, or who are starting
              preparation for the first time. Every topic begins from the concept and is practised
              until it is automatic.
            </p>
            <ul className="mt-5 space-y-2.5 border-t border-deep-100 pt-5">
              {levelFacts('Basic').map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-deep-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-panel border border-deep-100 bg-white p-6 sm:p-8">
            <Badge tone="deep">Advanced</Badge>
            <h3 className="mt-4 font-display text-xl font-bold text-deep-700">
              Raise the ceiling on a foundation that already holds
            </h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-deep-500">
              For students whose fundamentals are secure and whose remaining points sit in the
              hardest questions. Difficulty, timing and strategy all rise deliberately.
            </p>
            <ul className="mt-5 space-y-2.5 border-t border-deep-100 pt-5">
              {levelFacts('Advanced').map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-deep-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-deep-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-deep-400">
          A student can move from Basic to Advanced mid-program when quiz and mock results support
          it. Read more about how that decision is made in{' '}
          <Link href="/mentoring" className="link-underline font-semibold text-sky-600">
            mentoring &amp; advising
          </Link>
          .
        </p>
      </Section>

      {/* ---------- Comparison table ---------- */}
      <Section tone="mist">
        <SectionHeading
          eyebrow="Side by side"
          title="All six courses, compared"
          lead="Every figure comes from the official curricula. Exact schedules and start dates are confirmed when a student registers."
        />

        <div className="mt-10 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0" data-testid="compare-table">
          <table className="w-full min-w-[60rem] border-separate border-spacing-0 text-left">
            <caption className="sr-only">Comparison of the six SAT, EST and ACT Math courses</caption>
            <thead>
              <tr>
                <th scope="col" className="w-36 rounded-tl-card border-b border-deep-100 bg-white p-4 text-xs font-semibold uppercase tracking-wider text-deep-400">
                  Course
                </th>
                {COURSES.map((c, i) => (
                  <th
                    key={c.slug}
                    scope="col"
                    className={`border-b border-l border-deep-100 bg-white p-4 align-top ${i === COURSES.length - 1 ? 'rounded-tr-card' : ''}`}
                  >
                    <Link href={`/programs/${c.slug}`} className="group block">
                      <Badge tone={EXAM_TONE[c.exam]}>{c.exam}</Badge>
                      <span className="mt-2 block font-display text-base font-bold text-deep-700 group-hover:text-sky-600">
                        {c.level}
                      </span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, ri) => (
                <tr key={row.label}>
                  <th
                    scope="row"
                    className={`border-b border-deep-100 bg-white p-4 align-top text-sm font-semibold text-deep-600 ${ri === COMPARE_ROWS.length - 1 ? 'rounded-bl-card' : ''}`}
                  >
                    {row.label}
                  </th>
                  {COURSES.map((c, i) => (
                    <td
                      key={c.slug}
                      className={`border-b border-l border-deep-100 bg-white p-4 align-top text-sm leading-relaxed text-deep-500 ${
                        ri === COMPARE_ROWS.length - 1 && i === COURSES.length - 1 ? 'rounded-br-card' : ''
                      }`}
                    >
                      {row.value(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section tone="paper">
        <SectionHeading eyebrow="Common questions" title="Before you choose" />

        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          {FAQS.slice(0, 6).map((faq) => (
            <details
              key={faq.q}
              className="group rounded-card border border-deep-100 bg-white p-5 open:shadow-card sm:p-6"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-base font-semibold text-deep-700 marker:hidden">
                {faq.q}
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-sky-500 transition-transform duration-300 ease-calm group-open:rotate-45"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4">
                    <path
                      d="M8 3v10M3 8h10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-deep-500">{faq.a}</p>
            </details>
          ))}
        </div>

        <Link
          href="/contact"
          className="group mt-8 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          Ask a question directly
          <ArrowRight />
        </Link>
      </Section>

      <CtaBand
        eyebrow="Registration"
        title="Start with the diagnostic assessment"
        body="The assessment decides the program and the level. Message on WhatsApp or send the contact form, and the first step will be arranged."
        primary={{ label: 'Contact Mr. Desouky', href: '/contact' }}
        whatsapp
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Programs', path: '/programs' },
          ]),
          faqJsonLd(FAQS.slice(0, 6)),
        ]}
      />
    </>
  )
}
