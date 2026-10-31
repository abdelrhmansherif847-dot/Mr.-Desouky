import { SAT_MATH_BASIC } from './sat-math-basic'
import { SAT_MATH_ADVANCED } from './sat-math-advanced'
import { EST_MATH_BASIC } from './est-math-basic'
import { EST_MATH_ADVANCED } from './est-math-advanced'
import { ACT_MATH_BASIC } from './act-math-basic'
import { ACT_MATH_ADVANCED } from './act-math-advanced'
import { SAT_MATH_BASIC_OBJECTIVES } from './objectives/sat-math-basic'
import { SAT_MATH_ADVANCED_OBJECTIVES } from './objectives/sat-math-advanced'
import { EST_MATH_BASIC_OBJECTIVES } from './objectives/est-math-basic'
import { EST_MATH_ADVANCED_OBJECTIVES } from './objectives/est-math-advanced'
import { ACT_MATH_BASIC_OBJECTIVES } from './objectives/act-math-basic'
import { ACT_MATH_ADVANCED_OBJECTIVES } from './objectives/act-math-advanced'
import { EXAM_FORMATS, SAT_TOPIC_SCOPE } from './exams'
import { buildCourses, type Course, type Lesson } from './model'

/**
 * The one place the site reads courses and lessons from. Built from the data
 * files at import time; inconsistent data stops the build with a list of
 * every problem (see validateCurriculum in ./model).
 */
export const COURSES: readonly Course[] = buildCourses({
  // SAT, EST, ACT; Basic before Advanced.
  curricula: [SAT_MATH_BASIC, SAT_MATH_ADVANCED, EST_MATH_BASIC, EST_MATH_ADVANCED, ACT_MATH_BASIC, ACT_MATH_ADVANCED],
  objectives: {
    'sat-math-basic': SAT_MATH_BASIC_OBJECTIVES,
    'sat-math-advanced': SAT_MATH_ADVANCED_OBJECTIVES,
    'est-math-basic': EST_MATH_BASIC_OBJECTIVES,
    'est-math-advanced': EST_MATH_ADVANCED_OBJECTIVES,
    'act-math-basic': ACT_MATH_BASIC_OBJECTIVES,
    'act-math-advanced': ACT_MATH_ADVANCED_OBJECTIVES,
  },
  formats: EXAM_FORMATS,
  scope: SAT_TOPIC_SCOPE,
})

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((course) => course.slug === slug)
}

export function getLesson(courseSlug: string, lessonNumber: number): Lesson | undefined {
  return getCourse(courseSlug)?.lessons.find((lesson) => lesson.number === lessonNumber)
}

export function getLessonById(id: string): Lesson | undefined {
  for (const course of COURSES) {
    const lesson = course.lessons.find((l) => l.id === id)
    if (lesson) return lesson
  }
  return undefined
}

export { OBJECTIVE_REVIEW_LABEL, LESSON_SECTIONS, displayTopic, visibleFacts, shownScope } from './model'
export type { Course, Lesson, LessonTopic, AssessmentPlan, SectionState } from './model'
