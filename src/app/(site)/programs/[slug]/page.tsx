import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section, SectionHeading } from '@/components/ui/Section'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { Portrait } from '@/components/brand/Portrait'
import { Reveal } from '@/components/motion/Reveal'
import { CourseSectionNav } from '@/components/courses/CourseSectionNav'
import { CourseCurriculum } from '@/components/courses/CourseCurriculum'
import { COURSES, OBJECTIVE_REVIEW_LABEL, getCourse } from '@/content/curriculum'
import { RESOURCES } from '@/content/resources'
import { PORTAL_NAV, whatsappLink } from '@/content/site'
import {
  EXAM_NAME,
  EXAM_TONE,
  TARGET_LABEL,
  contactHref,
  courseFacts,
  courseSummary,
  enquiryMessage,
  finalReviewText,
  lessonLength,
  lessonRefs,
  prerequisites,
  quizCount,
  relatedCourses,
  resourcesFor,
  straplineParts,
} from '@/lib/courses/present'
import { JsonLd, breadcrumbJsonLd, courseJsonLd, pageMeta } from '@/lib/seo'
import { cn } from '@/lib/utils'

export function generateStaticParams() {
  return COURSES.map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = getCourse(slug)
  if (!course) return {}

  return pageMeta({
    title: `${course.title} (${course.grade})`,
    description: `${course.title}: ${course.lessons.length} lessons for ${course.grade} students preparing for ${TARGET_LABEL[course.target]}. The full curriculum, assessment plan, homework and how to enrol.`,
    path: `/programs/${course.slug}`,
    keywords: [
      `${course.exam} Math`,
      `${course.exam} Math ${course.level}`,
      `${course.exam} Math course`,
      `${course.exam} Math Egypt`,
      `${TARGET_LABEL[course.target]} Math preparation`,
    ],
  })
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'resources', label: 'Resources' },
  { id: 'progress', label: 'Progress' },
  { id: 'enrol', label: 'Enrol' },
]

/** What the student and parent portals already record for every student. */
const RECORDED = [
  { title: 'Sessions', body: 'Every lesson attended or missed, and what to prepare for the next one.' },
  { title: 'Homework', body: 'Each set, its status, score and written feedback.' },
  { title: 'Quizzes', body: 'Scores, with results broken down by topic.' },
  { title: 'Mock exams', body: 'Every mock exam, its score and section results.' },
  { title: 'Feedback', body: 'Written notes and the next step after quizzes and mocks.' },
]

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = getCourse(slug)
  if (!course) notFound()

  const tone = EXAM_TONE[course.exam]
  const facts = courseFacts(course)
  const related = relatedCourses(course, COURSES)
  const resources = resourcesFor(course, RESOURCES)
  const { quizzes, mocks, homeworkSets, mockLessons } = course.assessment

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Section tone="paper" grid containerClassName="pb-10 pt-10 sm:pt-14 lg:pb-14 lg:pt-16">
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
            <li className="text-deep-600" aria-current="page">{course.title}</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 motion-safe:animate-fade-up">
              <Badge tone={tone}>{EXAM_NAME[course.exam]}</Badge>
              <Badge tone={course.level === 'Advanced' ? 'deep' : 'neutral'}>{course.level}</Badge>
              <Badge tone="neutral">{course.grade}</Badge>
            </div>

            <h1 className="mt-5 text-display-lg text-deep-700 motion-safe:animate-fade-up">
              {/* Keeps the dash with the exam name when the title wraps. */}
              {course.title.replace(' – ', '\u00a0– ')}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
              {straplineParts(course.strapline).map((part, i) => (
                <span key={part} className="flex items-center gap-3">
                  {i > 0 ? <span aria-hidden="true" className="h-1 w-1 rounded-full bg-sky-300" /> : null}
                  {part}
                </span>
              ))}
            </p>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-deep-500 sm:text-lg">{courseSummary(course)}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={contactHref(course)} size="lg" className="group w-full sm:w-auto">
                Enrol in this course
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href={whatsappLink(enquiryMessage(course))} external variant="secondary" size="lg" className="w-full sm:w-auto">
                Ask on WhatsApp
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-deep-400">
              Fees on request. Every course starts with the diagnostic assessment.
            </p>
          </div>

          {/* Course introduction: an approved portrait placement. */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-xs lg:max-w-none">
              <Portrait treatment="frame" sizes="(min-width: 1024px) 24rem, 60vw" />
              <p className="mt-8 text-sm leading-relaxed text-deep-400">
                Taught personally by Eng. Abdelrhman Desouky, in the order of the official {course.title} curriculum.
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-deep-100 bg-deep-100 sm:grid-cols-4 xl:grid-cols-8">
          {facts.map((fact, i) => (
            <Reveal key={fact.label} index={i} variant="fade" className="bg-white p-4 sm:p-5">
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">{fact.label}</dt>
              <dd className="mt-1.5 font-display text-sm font-bold leading-snug text-deep-700">{fact.value}</dd>
            </Reveal>
          ))}
        </dl>
      </Section>

      <CourseSectionNav items={SECTIONS} />

      {/* ---------- Overview ---------- */}
      <Section id="overview" tone="mist" className="scroll-mt-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Overview"
              title="Who the course is for"
              lead="The grade and the level come from the official curriculum. The diagnostic assessment confirms the right course for each student before the first lesson."
            />

            <dl className="mt-8 divide-y divide-deep-100 rounded-card border border-deep-100 bg-white">
              {prerequisites(course, COURSES).map((item) => (
                <div key={item.label} className="grid grid-cols-[7.5rem_1fr] gap-4 p-4 sm:p-5">
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-deep-300">{item.label}</dt>
                  <dd className="text-sm font-semibold leading-relaxed text-deep-700">
                    {item.href ? (
                      <Link href={item.href} className="link-underline text-sky-700">{item.value}</Link>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-card border border-sky-100 bg-white p-5 sm:p-6">
              <p className="eyebrow text-sky-700">Prepares for</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-deep-700">{TARGET_LABEL[course.target]}</p>
              <p className="mt-3 text-sm leading-relaxed text-deep-500">
                Official exam details, such as format, timing and scoring, are pending official verification. They
                will appear here once confirmed against the exam publisher’s own documents.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-xl font-bold text-deep-700">Learning outcomes</h3>
              <Badge tone="olive">{OBJECTIVE_REVIEW_LABEL.draft}</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-deep-500">
              Drafted from the official lesson titles, and listed with the lessons each one comes from. The teacher
              reviews them before they are final.
            </p>
            <ul className="mt-6 space-y-3" data-testid="course-outcomes">
              {course.outcomes.map((outcome, i) => (
                <Reveal
                  as="li"
                  key={outcome.text}
                  index={i}
                  variant="up"
                  className="flex items-start gap-4 rounded-card border border-deep-100 bg-white p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 font-mono text-xs font-bold text-sky-700">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[0.95rem] leading-relaxed text-deep-700">{outcome.text}</span>
                    <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-deep-300">
                      {outcome.lessons.length === 1 ? 'Lesson' : 'Lessons'} {lessonRefs(outcome.lessons)}
                    </span>
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        {/* How the course runs: the cycle every lesson goes through. */}
        <div className="mt-16">
          <h3 className="font-display text-xl font-bold text-deep-700">How the course runs</h3>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { step: 'Lesson', detail: `${course.lessons.length} lessons of ${lessonLength(course)}, taught in order` },
              { step: 'Homework', detail: `A set ${course.delivery.homework.toLowerCase()}` },
              { step: 'Quiz', detail: `${quizCount(course)} quizzes, ${quizzes.when.toLowerCase()}` },
              { step: 'Mock exam', detail: `${mocks.count} mock exams (${mocks.format})` },
              { step: 'Tracking', detail: `Performance tracking: ${course.delivery.tracking}` },
            ].map((item, i, all) => (
              <Reveal as="li" key={item.step} index={i} variant="up" className="relative rounded-card border border-deep-100 bg-white p-5">
                <span className="font-mono text-[0.62rem] font-semibold tracking-[0.16em] text-sky-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-2 font-display text-base font-bold text-deep-700">{item.step}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-deep-500">{item.detail}</p>
                {i < all.length - 1 ? (
                  <span aria-hidden="true" className="absolute -right-2 top-1/2 hidden h-px w-4 bg-sky-300 lg:block" />
                ) : null}
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* ---------- Curriculum ---------- */}
      <Section id="curriculum" tone="paper" className="scroll-mt-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-40">
              <SectionHeading
                eyebrow="Curriculum"
                title={`The ${course.lessons.length} lessons, in order`}
                lead="The official lesson titles and topics, in the order they are taught. Open a lesson to see its topics and its draft learning objectives."
              />
              <p className="mt-6 text-sm leading-relaxed text-deep-400">
                Lesson notes, worked examples and practice sets are planned for every lesson. They are published
                here only once they exist.
              </p>
            </div>
          </div>
          <div className="lg:col-span-8">
            <CourseCurriculum course={course} />
          </div>
        </div>
      </Section>

      {/* ---------- Assessment ---------- */}
      <Section id="assessment" tone="deep" grid className="scroll-mt-28">
        <SectionHeading
          tone="dark"
          eyebrow="Assessment plan"
          title="Practice after every lesson, measured all the way through"
          lead={`The ${EXAM_NAME[course.exam]} assessment plan, kept to this exam: its own homework, quizzes and mock exams.`}
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { figure: String(homeworkSets), label: 'Homework sets', detail: course.delivery.homework },
            { figure: quizCount(course), label: 'Quizzes', detail: quizzes.when },
            { figure: String(mocks.count), label: 'Mock exams', detail: mocks.format },
            { figure: null, label: 'Performance tracking', detail: course.delivery.tracking },
          ].map((item, i) => (
            <Reveal
              key={item.label}
              index={i}
              variant="up"
              className="rounded-card border border-white/10 bg-white/[0.04] p-6 transition-[transform,background-color,border-color] duration-300 ease-calm hover:-translate-y-1 hover:border-sky-300/40 hover:bg-white/[0.08] motion-reduce:hover:translate-y-0"
            >
              {item.figure ? (
                <p className="font-display text-4xl font-extrabold text-white">{item.figure}</p>
              ) : (
                <svg viewBox="0 0 40 40" className="h-10 w-10 text-sky-300" aria-hidden="true">
                  <path d="M5 31 15 20l7 6 13-15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <p className="mt-2 font-display text-base font-bold text-sky-200">{item.label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-deep-100/70">{item.detail}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <div className="rounded-card border border-white/10 bg-white/[0.04] p-6">
            <p className="eyebrow text-sky-300">Mock exams inside lessons</p>
            <p className="mt-3 text-sm leading-relaxed text-deep-100/80">
              {mockLessons.length === 0
                ? 'None of the 24 lessons is itself a mock exam. The timed mocks run alongside the lessons.'
                : mockLessons
                    .map((n) => `Lesson ${n}, “${course.lessons[n - 1].title}”`)
                    .join(' and ') + (mockLessons.length === 1 ? ' includes a mock exam.' : ' include mock exams.')}
            </p>
          </div>
          <div className="rounded-card border border-white/10 bg-white/[0.04] p-6">
            <p className="eyebrow text-sky-300">Final review and mock</p>
            <p className="mt-3 text-sm leading-relaxed text-deep-100/80">{finalReviewText(course)}</p>
          </div>
          <div className="rounded-card border border-sky-300/30 bg-sky-400/[0.08] p-6">
            <p className="eyebrow text-sky-300">Exam format</p>
            <p className="mt-3 text-sm leading-relaxed text-deep-100/80">
              {TARGET_LABEL[course.target]} format and scoring details are pending official verification, so they are
              not shown yet. The mock exams follow the plan: {mocks.format}.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- Resources ---------- */}
      <Section id="resources" tone="mist" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Resources"
          title="Course resources"
          lead={`Material for ${EXAM_NAME[course.exam]} at this level, and guides that apply to every exam. Anything not yet available is marked so.`}
        />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="course-resources">
          <li className="rounded-card border border-dashed border-deep-200 bg-white/60 p-5">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">Lesson materials</p>
            <p className="mt-2 font-display text-base font-bold text-deep-700">Notes, worksheets and formula sheets</p>
            <p className="mt-1.5 text-sm leading-relaxed text-deep-500">
              Planned for each of the {course.lessons.length} lessons. Not yet published.
            </p>
            <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-400">Planned</p>
          </li>
          {resources.map((resource) => {
            const body = (
              <>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">{resource.kind}</p>
                <p className="mt-2 font-display text-base font-bold text-deep-700">{resource.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-deep-500">{resource.description}</p>
                <p
                  className={cn(
                    'mt-4 font-mono text-[0.6rem] uppercase tracking-[0.14em]',
                    resource.available ? 'text-growth-600' : 'text-deep-400',
                  )}
                >
                  {resource.available ? 'Available' : 'Coming soon'}
                </p>
              </>
            )
            return (
              <li key={resource.id}>
                {resource.available && resource.href ? (
                  <Link
                    href={resource.href}
                    className="block h-full rounded-card border border-deep-100 bg-white p-5 transition-[transform,border-color,box-shadow] duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-card motion-reduce:hover:translate-y-0"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="h-full rounded-card border border-deep-100 bg-white p-5">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
        <Link
          href="/resources"
          className="group mt-8 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          The full resource library
          <ArrowRight />
        </Link>
      </Section>

      {/* ---------- Progress ---------- */}
      <Section id="progress" tone="paper" className="scroll-mt-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Progress"
              title="Progress you can see, from real records"
              lead="Enrolled students and their parents follow progress in their own portals. Everything shown there is a record the teacher has entered. Nothing is estimated, and nothing is shown on this public page."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {PORTAL_NAV.map((item, i) => (
                <ButtonLink
                  key={item.href}
                  href={item.href}
                  variant={i === 0 ? 'primary' : 'secondary'}
                  className="group w-full sm:w-auto"
                >
                  {item.label}
                  <ArrowRight />
                </ButtonLink>
              ))}
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {RECORDED.map((item, i) => (
              <Reveal as="li" key={item.title} index={i} variant="up" className="rounded-card border border-deep-100 bg-white p-5">
                <p className="font-display text-base font-bold text-deep-700">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-deep-500">{item.body}</p>
              </Reveal>
            ))}
            <li className="rounded-card border border-sky-100 bg-sky-50/60 p-5">
              <p className="font-display text-base font-bold text-deep-700">In this course</p>
              <p className="mt-1.5 text-sm leading-relaxed text-deep-600">
                Performance tracking: {course.delivery.tracking.toLowerCase()}.
              </p>
            </li>
          </ul>
        </div>
      </Section>

      {/* ---------- Other courses ---------- */}
      <Section tone="mist" containerClassName="py-14 sm:py-16">
        <h2 className="font-display text-xl font-bold text-deep-700">Other courses</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {related.map((other) => (
            <Link
              key={other.slug}
              href={`/programs/${other.slug}`}
              className="group rounded-card border border-deep-100 bg-white p-5 transition-all duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-card motion-reduce:hover:translate-y-0 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={EXAM_TONE[other.exam]}>{other.exam}</Badge>
                <Badge tone="neutral">{other.level}</Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-deep-700 group-hover:text-sky-600">{other.title}</h3>
              <p className="mt-1.5 text-sm text-deep-500">
                {other.grade} · prepares for {TARGET_LABEL[other.target]}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <div id="enrol" className="scroll-mt-28">
        <CtaBand
          eyebrow="Enrol"
          title={`Enrol in ${course.title}`}
          body="The first step is the diagnostic assessment, which confirms this is the right course and level. Send the contact form or a WhatsApp message to arrange it."
          primary={{ label: 'Ask about this course', href: contactHref(course) }}
          whatsapp
          whatsappMessage={enquiryMessage(course)}
          note="Fees on request."
        />
      </div>

      <JsonLd
        data={[
          courseJsonLd({
            title: course.title,
            description: courseSummary(course),
            slug: course.slug,
            grade: course.grade,
            target: TARGET_LABEL[course.target],
            lessons: course.lessons.map((l) => `Lesson ${l.number}: ${l.title}`),
            prerequisite: course.level === 'Advanced' ? related[0]?.title : undefined,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Programs', path: '/programs' },
            { name: course.title, path: `/programs/${course.slug}` },
          ]),
        ]}
      />
    </>
  )
}
