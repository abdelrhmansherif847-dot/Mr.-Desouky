import Link from 'next/link'
import type { Course, Lesson } from '@/content/curriculum'
import { lessonNeighbours, lessonPath } from '@/lib/courses/present'

function Arrow({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={back ? 'h-4 w-4 rotate-180' : 'h-4 w-4'}>
      <path d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const card =
  'group flex h-full flex-col justify-between gap-3 rounded-card border border-deep-100 bg-white p-5 transition-[transform,border-color,box-shadow] duration-300 ease-calm hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-card motion-reduce:hover:translate-y-0 sm:p-6'

/**
 * Previous and next lesson, inside the same course. At either end, the card
 * leads back to the course instead.
 */
export function LessonPager({ course, lesson }: { course: Course; lesson: Lesson }) {
  const { prev, next } = lessonNeighbours(course, lesson)

  return (
    <nav aria-label="Lesson navigation" className="grid gap-3 sm:grid-cols-2" data-testid="lesson-pager">
      {prev ? (
        <Link href={lessonPath(course, prev)} rel="prev" className={card} data-testid="pager-prev">
          <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-sky-600">
            <Arrow back /> Previous · Lesson {prev.number}
          </span>
          <span className="font-display text-base font-bold text-deep-700 group-hover:text-sky-700">{prev.title}</span>
        </Link>
      ) : (
        <Link href={`/programs/${course.slug}`} className={card} data-testid="pager-prev">
          <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-sky-600">
            <Arrow back /> Start of the course
          </span>
          <span className="font-display text-base font-bold text-deep-700 group-hover:text-sky-700">{course.title} overview</span>
        </Link>
      )}
      {next ? (
        <Link href={lessonPath(course, next)} rel="next" className={`${card} sm:text-right`} data-testid="pager-next">
          <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-sky-600 sm:justify-end">
            Next · Lesson {next.number} <Arrow />
          </span>
          <span className="font-display text-base font-bold text-deep-700 group-hover:text-sky-700">{next.title}</span>
        </Link>
      ) : (
        <Link href={`/programs/${course.slug}#assessment`} className={`${card} sm:text-right`} data-testid="pager-next">
          <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-sky-600 sm:justify-end">
            End of the course <Arrow />
          </span>
          <span className="font-display text-base font-bold text-deep-700 group-hover:text-sky-700">The assessment plan</span>
        </Link>
      )}
    </nav>
  )
}
