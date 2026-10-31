import type { Course } from '@/content/curriculum'
import { OBJECTIVE_REVIEW_LABEL } from '@/content/curriculum'
import { hiddenTopicCount, publicTopics } from '@/lib/courses/present'
import { Badge } from '@/components/ui/Card'
import { LessonToggle } from './LessonToggle'

/**
 * The 24 lessons in their official order. Each opens to its approved
 * topics and its draft objectives. Topics still waiting for the teacher's
 * wording are not shown; the lesson says how many are being confirmed.
 * Nothing here is teaching content: lesson materials are marked planned.
 */
export function CourseCurriculum({ course }: { course: Course }) {
  const listId = `${course.slug}-lessons`

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-deep-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-deep-500" aria-label="Key">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />
            Official topics
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-olive-400" aria-hidden="true" />
            Learning objectives: draft, pending teacher review
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full border border-deep-300" aria-hidden="true" />
            Lesson materials: planned
          </li>
        </ul>
        <LessonToggle targetId={listId} />
      </div>

      <ol id={listId} className="relative mt-6 space-y-3" data-testid="lesson-list">
        {/* The rail that joins lesson 1 to lesson 24. */}
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-[1.6rem] top-6 w-px bg-gradient-to-b from-sky-200 via-deep-100 to-sky-200 sm:left-[1.85rem]"
        />
        {course.lessons.map((lesson) => {
          const topics = publicTopics(lesson)
          const hidden = hiddenTopicCount(lesson)
          return (
            <li key={lesson.id} className="relative">
              <details
                id={lesson.id}
                data-lesson={lesson.number}
                className="group scroll-mt-36 rounded-card border border-deep-100 bg-white transition-[border-color,box-shadow] duration-300 ease-calm open:border-sky-200 open:shadow-card hover:border-deep-200"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 p-3 pr-4 marker:hidden sm:gap-5 sm:p-4 sm:pr-5 [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden="true"
                    className="relative z-10 flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-full border border-deep-100 bg-paper font-mono text-xs font-bold text-deep-500 transition-colors duration-300 group-open:border-sky-500 group-open:bg-sky-500 group-open:text-white sm:h-11 sm:w-11"
                  >
                    {String(lesson.number).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-deep-300">
                      Lesson {lesson.number}
                    </span>
                    <h3 className="font-display text-base font-bold leading-snug text-deep-700 sm:text-lg">
                      {lesson.title}
                    </h3>
                    {lesson.clarification ? (
                      <span className="mt-0.5 block text-xs italic text-deep-400">{lesson.clarification}</span>
                    ) : null}
                  </span>
                  <span className="hidden shrink-0 items-center gap-2 sm:flex">
                    {lesson.hasMock ? <Badge tone="growth">Mock exam</Badge> : null}
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-deep-300">
                      {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-sky-500 transition-transform duration-300 ease-calm group-open:rotate-45 motion-reduce:transition-none"
                  >
                    <svg viewBox="0 0 16 16" className="h-4 w-4">
                      <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>

                <div className="grid gap-6 border-t border-deep-100 px-4 pb-5 pt-5 motion-safe:animate-fade-in sm:ml-[4.25rem] sm:grid-cols-2 sm:border-t-0 sm:px-5 sm:pt-1">
                  <div>
                    <p className="eyebrow text-sky-600">Topics</p>
                    <ul className="mt-3 space-y-2" data-testid="lesson-topics">
                      {topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2.5 text-sm leading-relaxed text-deep-600">
                          <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden="true" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                    {hidden > 0 ? (
                      <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-xs leading-relaxed text-deep-500">
                        {hidden === 1 ? 'One more topic is' : `${hidden} more topics are`} being confirmed by the
                        teacher and will appear here once confirmed.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="eyebrow text-olive-700">Learning objectives</p>
                      <span className="rounded-full bg-olive-50 px-2 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-olive-700 ring-1 ring-inset ring-olive-200/70">
                        {OBJECTIVE_REVIEW_LABEL.draft}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2" data-testid="lesson-objectives">
                      {lesson.objectives.map((objective) => (
                        <li key={objective.text} className="flex items-start gap-2.5 text-sm leading-relaxed text-deep-600">
                          <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-olive-400" aria-hidden="true" />
                          {objective.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="flex items-center gap-2 border-t border-dashed border-deep-100 pt-4 text-xs text-deep-400 sm:col-span-2">
                    <span className="h-2 w-2 shrink-0 rounded-full border border-deep-300" aria-hidden="true" />
                    Lesson notes, worked examples and practice are planned for this lesson and not yet published.
                    {lesson.hasMock ? ' This lesson includes a mock exam.' : ''}
                  </p>
                </div>
              </details>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
