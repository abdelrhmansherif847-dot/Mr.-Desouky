import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section } from '@/components/ui/Section'
import { Badge } from '@/components/ui/Card'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { CtaBand } from '@/components/sections/CtaBand'
import { LessonRail } from '@/components/courses/LessonRail'
import { LessonPager } from '@/components/courses/LessonPager'
import { LessonSectionBlock } from '@/components/courses/LessonSectionBlock'
import { RailScroller } from '@/components/courses/RailScroller'
import { COURSES, getCourse } from '@/content/curriculum'
import type { Course, Lesson } from '@/content/curriculum'
import {
  EXAM_NAME,
  EXAM_TONE,
  contactHref,
  enquiryMessage,
  hiddenTopicCount,
  lessonDescription,
  lessonNeighbours,
  lessonParam,
  lessonPath,
  parseLessonParam,
  publicTopics,
} from '@/lib/courses/present'
import { JsonLd, breadcrumbJsonLd, lessonJsonLd, pageMeta } from '@/lib/seo'

/**
 * Every lesson of every course is built ahead of time. Any other address
 * (a lesson number out of range, or not in its two-digit form) gets the
 * site's 404 page from notFound() below.
 */
export function generateStaticParams() {
  return COURSES.flatMap((course) =>
    course.lessons.map((lesson) => ({ slug: course.slug, lesson: lessonParam(lesson.number) })),
  )
}

type Params = Promise<{ slug: string; lesson: string }>

function resolve(slug: string, param: string): { course: Course; lesson: Lesson } | null {
  const course = getCourse(slug)
  if (!course) return null
  const number = parseLessonParam(param, course.lessons.length)
  const lesson = number === null ? undefined : course.lessons[number - 1]
  return lesson ? { course, lesson } : null
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug, lesson: param } = await params
  const found = resolve(slug, param)
  if (!found) return {}
  const { course, lesson } = found

  return pageMeta({
    title: `Lesson ${lesson.number}: ${lesson.title} — ${course.title}`,
    description: lessonDescription(course, lesson),
    path: lessonPath(course, lesson),
    keywords: [`${course.exam} Math ${lesson.title}`, `${course.title} lesson ${lesson.number}`, ...publicTopics(lesson).slice(0, 3)],
  })
}

/** What each part of the lesson says until the teacher publishes it. Nothing is filled in. */
function plannedText(key: string, course: Course): string {
  switch (key) {
    case 'explanation':
      return 'The teacher’s explanation of this lesson’s topics is planned and has not been published yet.'
    case 'examples':
      return 'Worked examples are planned. None are shown until the teacher has written and approved them.'
    case 'guided':
      return 'Guided practice is planned and has not been published yet.'
    case 'independent':
      return 'Independent practice is planned and has not been published yet.'
    case 'homework':
      return `This course sets homework ${course.delivery.homework.toLowerCase()}. The assignment for this lesson has not been published yet.`
    case 'summary':
      return 'The lesson summary is planned and will be published with the lesson’s content.'
    default:
      return 'Planned and not yet published.'
  }
}

export default async function LessonPage({ params }: { params: Params }) {
  const { slug, lesson: param } = await params
  const found = resolve(slug, param)
  if (!found) notFound()
  const { course, lesson } = found

  const topics = publicTopics(lesson)
  const hidden = hiddenTopicCount(lesson)
  const { next } = lessonNeighbours(course, lesson)
  const coursePath = `/programs/${course.slug}`
  // The hero shows the topics; every other part follows the model's order.
  const parts = lesson.sections.filter((s) => s.key !== 'topics')

  return (
    <>
      {/* ---------- Lesson hero ---------- */}
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
            <li>
              <Link href={coursePath} className="hover:text-sky-600">{course.title}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-deep-600" aria-current="page">Lesson {lessonParam(lesson.number)}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2 motion-safe:animate-fade-up">
              <Badge tone={EXAM_TONE[course.exam]}>{EXAM_NAME[course.exam]}</Badge>
              <Badge tone={course.level === 'Advanced' ? 'deep' : 'neutral'}>{course.level}</Badge>
              <Badge tone="neutral">{course.grade}</Badge>
              {lesson.hasMock ? <Badge tone="growth">Mock exam</Badge> : null}
            </div>

            <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              <Link href={coursePath} className="link-underline">{course.title}</Link>
              <span className="text-deep-300"> · Lesson {lesson.number} of {course.lessons.length}</span>
            </p>
            <h1 className="mt-3 text-display-lg text-deep-700 motion-safe:animate-fade-up" data-testid="lesson-title">
              {lesson.title}
            </h1>
            {lesson.clarification ? (
              <p className="mt-3 text-base italic text-deep-500">{lesson.clarification}</p>
            ) : null}

            <div className="mt-8">
              <h2 className="eyebrow text-sky-700">Topics</h2>
              <ul className="mt-3 flex flex-wrap gap-2" data-testid="lesson-topics">
                {topics.map((topic) => (
                  <li
                    key={topic}
                    className="rounded-full border border-sky-100 bg-white px-3.5 py-1.5 text-sm font-medium text-deep-700 shadow-card"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
              {hidden > 0 ? (
                <p className="mt-3 max-w-xl rounded-lg bg-mist px-3 py-2 text-xs leading-relaxed text-deep-500" data-testid="hidden-topics">
                  {hidden === 1 ? 'One more topic is' : `${hidden} more topics are`} being confirmed by the teacher and will
                  appear here once confirmed.
                </p>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {next ? (
                <ButtonLink href={lessonPath(course, next)} size="lg" className="group w-full sm:w-auto">
                  Next: Lesson {next.number}
                  <ArrowRight />
                </ButtonLink>
              ) : null}
              <ButtonLink href={`${coursePath}#curriculum`} variant="secondary" size="lg" className="w-full sm:w-auto">
                Back to the course
              </ButtonLink>
            </div>
          </div>

          {/* Where this lesson sits: a place in the course, not a progress state. */}
          <aside className="hidden lg:col-span-4 lg:block" aria-label="Lesson at a glance">
            <div className="rounded-panel border border-deep-100 bg-white p-6 shadow-card">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-deep-300">Lesson</p>
              <p className="mt-1 font-display text-6xl font-extrabold leading-none text-deep-700">
                {lessonParam(lesson.number)}
                <span className="ml-1 align-top font-mono text-base font-semibold text-deep-300">/ {course.lessons.length}</span>
              </p>
              <dl className="mt-6 space-y-3 border-t border-deep-100 pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-deep-400">Course</dt>
                  <dd className="text-right font-semibold text-deep-700">{course.title}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-deep-400">Learning objectives</dt>
                  <dd className="text-right font-semibold text-deep-700">{lesson.objectives.length}, draft</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-deep-400">Lesson materials</dt>
                  <dd className="text-right font-semibold text-deep-700">Planned</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </Section>

      {/* ---------- The lesson ---------- */}
      <Section tone="mist" containerClassName="py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-4 lg:col-span-8">
            {/* On small screens the course context comes first, folded away. */}
            <details className="group rounded-card border border-deep-100 bg-white lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-display text-sm font-semibold text-deep-700 marker:hidden [&::-webkit-details-marker]:hidden">
                All {course.lessons.length} lessons in {course.title}
                <span aria-hidden="true" className="text-sky-500 transition-transform duration-300 group-open:rotate-45">
                  <svg viewBox="0 0 16 16" className="h-4 w-4"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </span>
              </summary>
              <div className="border-t border-deep-100 p-2">
                <LessonRail course={course} current={lesson} />
              </div>
            </details>

            {parts.map((part, i) => (
              <LessonSectionBlock key={part.key} id={part.key} index={i + 1} label={part.label} state={part.state}>
                {part.key === 'objectives' ? (
                  <>
                    <ul className="space-y-2.5" data-testid="lesson-objectives">
                      {lesson.objectives.map((objective) => (
                        <li key={objective.text} className="flex items-start gap-3 text-[0.95rem] leading-relaxed text-deep-700">
                          <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-olive-400" aria-hidden="true" />
                          {objective.text}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs leading-relaxed text-deep-400">
                      Drafted from this lesson’s official topics. The teacher reviews them before they are final.
                    </p>
                  </>
                ) : (
                  <p className="max-w-2xl text-sm leading-relaxed text-deep-500" data-testid="planned-note">
                    {plannedText(part.key, course)}
                  </p>
                )}
              </LessonSectionBlock>
            ))}

            <div className="pt-4">
              <LessonPager course={course} lesson={lesson} />
            </div>
          </div>

          <aside className="hidden lg:col-span-4 lg:block" aria-label={`${course.title} curriculum`}>
            <div className="sticky top-28 rounded-panel border border-deep-100 bg-mist/60 p-3">
              <div className="flex items-baseline justify-between gap-3 px-3 pb-3 pt-2">
                <p className="font-display text-sm font-bold text-deep-700">Course curriculum</p>
                <Link href={`${coursePath}#curriculum`} className="link-underline text-xs font-semibold text-sky-600">
                  Course page
                </Link>
              </div>
              <RailScroller current={lesson.id} className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                <LessonRail course={course} current={lesson} />
              </RailScroller>
            </div>
          </aside>
        </div>
      </Section>

      <CtaBand
        eyebrow="Enrol"
        title={`Learn this in ${course.title}`}
        body="Every lesson is taught in order inside the course. The first step is the diagnostic assessment, which confirms the right course and level."
        primary={{ label: 'Ask about this course', href: contactHref(course) }}
        whatsapp
        whatsappMessage={enquiryMessage(course)}
        note="Fees on request."
      />

      <JsonLd
        data={[
          lessonJsonLd({
            name: `Lesson ${lesson.number}: ${lesson.title}`,
            description: lessonDescription(course, lesson),
            path: lessonPath(course, lesson),
            position: lesson.number,
            grade: course.grade,
            topics,
            course: { title: course.title, path: coursePath },
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Programs', path: '/programs' },
            { name: course.title, path: coursePath },
            { name: `Lesson ${lesson.number}: ${lesson.title}`, path: lessonPath(course, lesson) },
          ]),
        ]}
      />
    </>
  )
}
