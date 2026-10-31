import type { Course, Lesson } from '../../content/curriculum/model'
import type { Exam, ExamTest } from '../../content/curriculum/types'
import type { Resource } from '../../content/resources'

/**
 * How the course pages present the course model. Pure functions of the
 * model, so every sentence on a course page is derived from approved data
 * and nothing else. Type-only imports keep them testable with node.
 */

export const EXAM_NAME: Record<Exam, string> = { SAT: 'SAT Math', EST: 'EST Math', ACT: 'ACT Math' }

/** Badge tone per exam: SAT sky, EST olive, ACT growth. Never shared. */
export const EXAM_TONE: Record<Exam, 'sky' | 'olive' | 'growth'> = { SAT: 'sky', EST: 'olive', ACT: 'growth' }

/** The target test, as it reads in a sentence. */
export const TARGET_NAME: Record<ExamTest, string> = { SAT: 'the SAT', 'EST I': 'EST I', ACT: 'the ACT' }

/** The target test, as it reads on its own (a label or badge). */
export const TARGET_LABEL: Record<ExamTest, string> = { SAT: 'SAT', 'EST I': 'EST I', ACT: 'ACT' }

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)
const hours = (n: number) => String(n)

export function lessonLength(course: Course): string {
  const { min, max } = course.delivery.hoursPerLesson
  return min === max ? `${hours(min)} hours` : `${hours(min)}–${hours(max)} hours`
}

export function teachingTime(course: Course): string {
  const { min, max } = course.hours
  return min === max ? `${hours(min)} hours` : `${hours(min)}–${hours(max)} hours`
}

export function quizCount(course: Course): string {
  const { min, max } = course.assessment.quizzes
  return min === max ? String(min) : `${min}–${max}`
}

/** The image's strapline without its lesson count, e.g. ["STRONGER BASICS", "HIGHER SCORES"]. */
export function straplineParts(strapline: string): string[] {
  return strapline
    .split('•')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !/^\d+\s+LESSONS$/i.test(part))
}

/** The course description: every clause comes from the course data. */
export function courseSummary(course: Course): string {
  const first = course.lessons[0]
  const last = course.lessons[course.lessons.length - 1]
  const { quizzes, mocks, homework } = course.delivery
  return (
    `${course.title} is a ${course.lessons.length}-lesson course for ${course.grade} students preparing for ` +
    `${TARGET_NAME[course.target]}. It runs in order from Lesson ${first.number}, “${first.title}”, to Lesson ` +
    `${last.number}, “${last.title}”, with homework ${lowerFirst(homework)}, ${quizCount(course)} quizzes ` +
    `${lowerFirst(quizzes.when)} and ${mocks.count} timed mock exams.`
  )
}

/** Topics a visitor may see: only confirmed wording, display-cased. */
export function publicTopics(lesson: Lesson): string[] {
  return lesson.topics.filter((t) => t.confirmed).map((t) => t.display)
}

/** How many of a lesson's topics are still waiting for the teacher's wording. */
export function hiddenTopicCount(lesson: Lesson): number {
  return lesson.topics.filter((t) => !t.confirmed).length
}

/** "1–3", "11–14, 22": lesson numbers as compact ranges. */
export function lessonRefs(numbers: readonly number[]): string {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b)
  const parts: string[] = []
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i]
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++
    parts.push(start === sorted[i] ? String(start) : `${start}–${sorted[i]}`)
  }
  return parts.join(', ')
}

export type Fact = { label: string; value: string }

/** The facts strip: all from the course's delivery data. */
export function courseFacts(course: Course): Fact[] {
  return [
    { label: 'Grade', value: course.grade.replace(/^Grade /, '') },
    { label: 'Prepares for', value: TARGET_LABEL[course.target] },
    { label: 'Lessons', value: String(course.lessons.length) },
    { label: 'Lesson length', value: lessonLength(course) },
    { label: 'Teaching time', value: teachingTime(course) },
    { label: 'Quizzes', value: quizCount(course) },
    { label: 'Mock exams', value: `${course.assessment.mocks.count} timed` },
    { label: 'Homework', value: course.delivery.homework },
  ]
}

/** The other level of the same exam. */
export function siblingCourse(course: Course, all: readonly Course[]): Course | undefined {
  return all.find((c) => c.exam === course.exam && c.slug !== course.slug)
}

/** The sibling level first, then the same level in the other exams. */
export function relatedCourses(course: Course, all: readonly Course[]): Course[] {
  const sibling = siblingCourse(course, all)
  const sameLevel = all.filter((c) => c.level === course.level && c.exam !== course.exam)
  return [...(sibling ? [sibling] : []), ...sameLevel]
}

export type Prerequisite = { label: string; value: string; href?: string }

/** Only what the curriculum and the existing admission process establish. */
export function prerequisites(course: Course, all: readonly Course[]): Prerequisite[] {
  const list: Prerequisite[] = [{ label: 'Grade', value: course.grade }]
  const basic = course.level === 'Advanced' ? siblingCourse(course, all) : undefined
  if (basic) list.push({ label: 'Follows on from', value: basic.title, href: `/programs/${basic.slug}` })
  list.push({ label: 'Placement', value: 'Confirmed by the diagnostic assessment before the course starts' })
  return list
}

/** Library items for this exam and level, or for every exam and level. */
export function resourcesFor(course: Course, resources: readonly Resource[]): Resource[] {
  return resources.filter(
    (r) => (r.track === course.exam || r.track === 'All') && (r.level === course.level || r.level === 'All'),
  )
}

export function finalReviewText(course: Course): string {
  const review = course.assessment.finalReview
  return review.in === 'lesson'
    ? `Lesson ${review.lesson}, “${course.lessons[review.lesson - 1].title}”, closes the course with a mock exam.`
    : 'The final review and mock exam are part of the course’s assessment plan rather than a numbered lesson.'
}

/** A pre-filled WhatsApp enquiry about one course. */
export function enquiryMessage(course: Course): string {
  return `Hello Mr. Desouky, I would like to ask about ${course.title} (${course.grade}).`
}

/** The contact page with this course already chosen. */
export function contactHref(course: Course): string {
  return `/contact?course=${course.slug}`
}

/** One line per exam for the listings: who it is for, and its two levels. */
export function examBlurb(exam: Exam, all: readonly Course[]): string {
  const courses = all.filter((c) => c.exam === exam)
  const target = courses[0] ? TARGET_NAME[courses[0].target] : exam
  const levels = courses.map((c) => `${c.level} for ${c.grade}`).join(' and ')
  return `For students preparing for ${target}: ${levels}, ${courses[0]?.lessons.length ?? 0} lessons each.`
}
