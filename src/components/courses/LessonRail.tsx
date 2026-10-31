import Link from 'next/link'
import type { Course, Lesson } from '@/content/curriculum'
import { lessonParam, lessonPath } from '@/lib/courses/present'
import { cn } from '@/lib/utils'

/**
 * The whole course, in order, with the current lesson marked: the
 * curriculum context beside every lesson. A list of places, not a progress
 * tracker, so it shows no completion state.
 */
export function LessonRail({ course, current }: { course: Course; current: Lesson }) {
  return (
    <ol className="space-y-0.5" data-testid="lesson-rail">
      {course.lessons.map((lesson) => {
        const isCurrent = lesson.id === current.id
        return (
          <li key={lesson.id}>
            <Link
              href={lessonPath(course, lesson)}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'group flex items-start gap-3 rounded-lg px-3 py-2 text-sm leading-snug transition-colors duration-200 ease-calm',
                isCurrent ? 'bg-deep-700 text-white' : 'text-deep-600 hover:bg-white hover:text-deep-800',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 shrink-0 font-mono text-[0.68rem] font-semibold tabular-nums',
                  isCurrent ? 'text-sky-300' : 'text-deep-300 group-hover:text-sky-600',
                )}
              >
                {lessonParam(lesson.number)}
              </span>
              <span className={cn(isCurrent && 'font-semibold')}>{lesson.title}</span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
