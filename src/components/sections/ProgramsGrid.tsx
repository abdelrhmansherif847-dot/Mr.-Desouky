import Link from 'next/link'
import { Badge } from '@/components/ui/Card'
import { Reveal } from '@/components/motion/Reveal'
import { ArrowRight } from '@/components/ui/Button'
import { COURSES } from '@/content/curriculum'
import { EXAMS } from '@/content/curriculum/model'
import { EXAM_NAME, EXAM_TONE, TARGET_LABEL, examBlurb, straplineParts, teachingTime } from '@/lib/courses/present'
import { cn } from '@/lib/utils'

const HEADER_TONE = { SAT: 'bg-sky-50/70', EST: 'bg-olive-50/60', ACT: 'bg-growth-50/60' } as const

/**
 * SAT, EST and ACT side by side, each with its two levels: three separate
 * columns, never mixed or interleaved in one list. Everything shown comes
 * from the curriculum model.
 */
export function ProgramsGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-6">
      {EXAMS.map((exam, examIndex) => {
        const courses = COURSES.filter((c) => c.exam === exam)

        return (
          <Reveal
            key={exam}
            variant="up"
            delay={examIndex * 90}
            className="flex flex-col overflow-hidden rounded-panel border border-deep-100 bg-white"
          >
            <div className={cn('border-b border-deep-100 p-6 sm:p-7', HEADER_TONE[exam])}>
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl font-bold text-deep-700">{EXAM_NAME[exam]}</h3>
                <Badge tone={EXAM_TONE[exam]}>{exam}</Badge>
              </div>
              {!compact ? <p className="mt-3 text-sm leading-relaxed text-deep-500">{examBlurb(exam, COURSES)}</p> : null}
            </div>

            <ul className="flex flex-1 flex-col divide-y divide-deep-100">
              {courses.map((course) => (
                <li key={course.slug} className="flex-1">
                  <Link
                    href={`/programs/${course.slug}`}
                    className="group flex h-full flex-col p-6 transition-colors duration-300 ease-calm hover:bg-mist sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-deep-300">
                          {course.grade}
                        </p>
                        <h4 className="mt-1.5 font-display text-xl font-bold text-deep-700 group-hover:text-sky-600">
                          {course.level}
                        </h4>
                      </div>
                      <span className="mt-1 text-sky-500">
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>

                    <p className="mt-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-sky-700">
                      {straplineParts(course.strapline).join(' · ')}
                    </p>

                    {!compact ? (
                      <p className="mt-3 text-sm leading-relaxed text-deep-500">
                        From “{course.lessons[0].title}” to “{course.lessons[course.lessons.length - 1].title}”.
                      </p>
                    ) : null}

                    <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-deep-100 pt-4">
                      {[
                        { label: 'Lessons', value: String(course.lessons.length) },
                        { label: 'Teaching time', value: teachingTime(course) },
                        { label: 'Prepares for', value: TARGET_LABEL[course.target] },
                      ].map((fact) => (
                        <div key={fact.label}>
                          <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">{fact.label}</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-deep-600">{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )
      })}
    </div>
  )
}
