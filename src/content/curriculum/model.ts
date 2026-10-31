import type {
  CourseCurriculum,
  CourseDelivery,
  CourseObjectives,
  Exam,
  ExamFact,
  ExamFormat,
  LearningObjective,
  LessonStatus,
  Level,
  ObjectiveReview,
  TopicScope,
} from './types'

/**
 * The course model: validation and the derived course view, built from the
 * data files and nothing else. Pure functions with type-only imports, so the
 * tests run them directly.
 */

export const EXAMS: readonly Exam[] = ['SAT', 'EST', 'ACT']
export const LEVELS: readonly Level[] = ['Basic', 'Advanced']
export const LESSONS_PER_COURSE = 24

export const OBJECTIVE_REVIEW_LABEL: Record<ObjectiveReview, string> = {
  draft: 'Draft — Pending Teacher Review',
  approved: 'Approved by the teacher',
}

/** The eleven parts of every lesson, in page order. */
export const LESSON_SECTIONS = [
  { key: 'overview', label: 'Lesson overview' },
  { key: 'objectives', label: 'Learning objectives' },
  { key: 'topics', label: 'Topics' },
  { key: 'concepts', label: 'Key concepts and formulas' },
  { key: 'examples', label: 'Worked examples' },
  { key: 'methods', label: 'Step-by-step methods' },
  { key: 'mistakes', label: 'Common mistakes' },
  { key: 'guided', label: 'Guided practice' },
  { key: 'independent', label: 'Independent practice' },
  { key: 'summary', label: 'Summary' },
  { key: 'homework', label: 'Homework and next steps' },
] as const

export type LessonSectionKey = (typeof LESSON_SECTIONS)[number]['key']

/**
 * available - drawn from the approved curriculum
 * draft     - drafted and awaiting the teacher's review
 * planned   - no content exists yet; shown as planned and never filled in
 */
export type SectionState = 'available' | 'draft' | 'planned'

export type LessonTopic = {
  /** As stored: the approved wording, or exactly as printed. */
  text: string
  /** For display: the first letter capitalised. */
  display: string
  /** `false` while the wording waits for the teacher. */
  confirmed: boolean
}

export type Lesson = {
  id: string
  courseSlug: string
  exam: Exam
  number: number
  title: string
  clarification?: string
  topics: LessonTopic[]
  objectives: LearningObjective[]
  status: LessonStatus
  sections: { key: LessonSectionKey; label: string; state: SectionState }[]
  /** The lesson's own topics include a mock exam. */
  hasMock: boolean
}

export type AssessmentPlan = {
  /** One homework set after every lesson. */
  homeworkSets: number
  quizzes: CourseDelivery['quizzes']
  mocks: CourseDelivery['mocks']
  /** Lessons whose approved title or topics are a mock exam. */
  mockLessons: number[]
}

export type Course = Omit<CourseCurriculum, 'lessons'> & {
  lessons: Lesson[]
  /** Total teaching hours across all lessons. */
  hours: { min: number; max: number }
  assessment: AssessmentPlan
  format: ExamFormat
  /** Proposed core/extension labels for this course's topics, if any. */
  scope: TopicScope[]
}

export type CurriculumInput = {
  curricula: readonly CourseCurriculum[]
  /** Objectives by course slug, then by lesson ID. */
  objectives: Readonly<Record<string, CourseObjectives>>
  formats: Readonly<Record<Exam, ExamFormat>>
  scope: readonly TopicScope[]
}

export function displayTopic(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Facts that may be shown to visitors: only those read in the original. */
export function visibleFacts(format: ExamFormat): ExamFact[] {
  return format.facts.filter((fact) => fact.verification === 'confirmed')
}

/** Scope labels that may be shown: confirmed against the source and approved. */
export function shownScope(scope: readonly TopicScope[]): TopicScope[] {
  return scope.filter((s) => s.verification === 'confirmed' && s.review === 'approved')
}

const MOCK = /\bmock\b/i

/** Topic indices whose wording still waits for the teacher. */
function pendingTopics(lesson: CourseCurriculum['lessons'][number]): Set<number> {
  return new Set((lesson.notes ?? []).filter((n) => n.decision === 'teacher-check').map((n) => n.at))
}

function untidy(text: string): string | null {
  if (text.length === 0) return 'is empty'
  if (text !== text.trim()) return 'has surrounding spaces'
  if (/\s{2}/.test(text)) return 'has a double space'
  return null
}

/** Every problem in the data, as readable sentences. An empty list means consistent. */
export function validateCurriculum(input: CurriculumInput): string[] {
  const problems: string[] = []
  const say = (where: string, what: string) => problems.push(`${where}: ${what}`)
  const ids = new Set<string>()

  const pairs = input.curricula.map((c) => `${c.exam} ${c.level}`)
  for (const exam of EXAMS) {
    for (const level of LEVELS) {
      const n = pairs.filter((p) => p === `${exam} ${level}`).length
      if (n !== 1) say('courses', `${exam} ${level} appears ${n} times, not once`)
    }
  }

  for (const c of input.curricula) {
    const others = EXAMS.filter((e) => e !== c.exam)
    const checkText = (where: string, text: string) => {
      const issue = untidy(text)
      if (issue) say(where, `"${text}" ${issue}`)
      for (const other of others) {
        if (new RegExp(`\\b${other}\\b`).test(text)) say(where, `"${text}" names ${other} in a ${c.exam} course`)
      }
    }

    if (c.slug !== `${c.exam}-math-${c.level}`.toLowerCase()) say(c.slug, 'slug does not match exam and level')
    if (c.title !== `${c.exam} Math – ${c.level}`) say(c.slug, `title "${c.title}" does not match exam and level`)
    if (c.grade !== (c.level === 'Basic' ? 'Grade 10' : 'Grade 11–12')) say(c.slug, `grade "${c.grade}" does not match level`)
    for (const t of [c.title, c.grade, c.strapline, ...c.slogans]) checkText(c.slug, t)

    const d = c.delivery
    if (!(d.hoursPerLesson.min > 0 && d.hoursPerLesson.min <= d.hoursPerLesson.max)) say(c.slug, 'lesson hours are not a valid range')
    if (!(d.quizzes.min > 0 && d.quizzes.min <= d.quizzes.max)) say(c.slug, 'quiz count is not a valid range')
    if (!(d.mocks.count > 0)) say(c.slug, 'no mock exams')
    if (!d.mocks.format.includes(c.exam)) say(c.slug, `mock format "${d.mocks.format}" does not name ${c.exam}`)
    for (const t of [d.quizzes.when, d.mocks.format, d.homework, d.tracking]) checkText(c.slug, t)

    if (c.lessons.length !== LESSONS_PER_COURSE) say(c.slug, `${c.lessons.length} lessons, not ${LESSONS_PER_COURSE}`)
    const prefix = `${c.exam}-${c.level}`.toLowerCase()

    c.lessons.forEach((l, i) => {
      if (l.number !== i + 1) say(l.id, `number ${l.number} at position ${i + 1}`)
      if (l.id !== `${prefix}-L${String(l.number).padStart(2, '0')}`) say(l.id, 'id does not match course and number')
      if (ids.has(l.id)) say(l.id, 'id is used twice')
      ids.add(l.id)
      if (l.status !== 'planned') say(l.id, 'published, but no teaching content exists yet')
      if (l.topics.length === 0) say(l.id, 'has no topics')
      for (const t of [l.title, ...l.topics]) {
        checkText(l.id, t)
        if (/[,.]$/.test(t)) say(l.id, `"${t}" ends in punctuation`)
      }
      if (l.clarification !== undefined) checkText(l.id, l.clarification)

      for (const n of l.notes ?? []) {
        const topic = l.topics[n.at]
        if (topic === undefined) {
          say(l.id, `note points at topic ${n.at + 1}, which does not exist`)
          continue
        }
        if (n.kind === 'joined') {
          if (n.decision !== 'applied' || n.printed.split(' | ').join(' ') !== topic) say(l.id, `joined note does not match "${topic}"`)
        } else if (n.decision === 'applied') {
          if (!n.proposed || n.proposed === n.printed) say(l.id, 'an applied correction has no distinct wording')
          else if (topic !== n.proposed) say(l.id, `approved correction "${n.proposed}" is not applied`)
        } else if (topic !== n.printed) {
          say(l.id, `"${topic}" awaits the teacher, so it must stay as printed ("${n.printed}")`)
        }
      }
    })

    // Objectives: one list per lesson, each drawn only from confirmed topics.
    const objectives = input.objectives[c.slug]
    if (!objectives) {
      say(c.slug, 'has no objectives file')
      continue
    }
    const lessonIds = new Set(c.lessons.map((l) => l.id))
    for (const key of Object.keys(objectives)) if (!lessonIds.has(key)) say(c.slug, `objectives for unknown lesson ${key}`)
    for (const l of c.lessons) {
      const list = objectives[l.id]
      if (!list || list.length === 0) {
        say(l.id, 'has no objectives')
        continue
      }
      const pending = pendingTopics(l)
      const covered = new Set<number>()
      for (const o of list) {
        checkText(l.id, o.text)
        if (!/^[A-Z0-9]/.test(o.text)) say(l.id, `objective "${o.text}" should start with a capital`)
        if (/[.]$/.test(o.text)) say(l.id, `objective "${o.text}" ends in a full stop`)
        if (o.review !== 'draft' && o.review !== 'approved') say(l.id, `objective "${o.text}" has no review state`)
        if (o.from.length === 0) say(l.id, `objective "${o.text}" is not drawn from any topic`)
        if (new Set(o.from).size !== o.from.length) say(l.id, `objective "${o.text}" names a topic twice`)
        for (const i of o.from) {
          if (l.topics[i] === undefined) say(l.id, `objective "${o.text}" points at topic ${i + 1}, which does not exist`)
          else if (pending.has(i)) say(l.id, `objective "${o.text}" is drawn from "${l.topics[i]}", which awaits the teacher`)
          covered.add(i)
        }
      }
      l.topics.forEach((t, i) => {
        if (!pending.has(i) && !covered.has(i)) say(l.id, `topic "${t}" has no objective`)
      })
    }
  }

  // Exam formats: one per exam, every fact sourced.
  for (const exam of EXAMS) {
    const f = input.formats[exam]
    if (!f) {
      say('formats', `${exam} has no format`)
      continue
    }
    if (f.exam !== exam) say('formats', `${exam} entry describes ${f.exam}`)
    if (f.facts.length === 0) say(exam, 'format has no facts')
    for (const fact of f.facts) {
      if (fact.sources.length === 0) say(exam, `"${fact.label}" has no source`)
      for (const s of fact.sources) if (!s.url.startsWith('https://')) say(exam, `"${fact.label}" source is not an https URL`)
      if (!['confirmed', 'to-confirm', 'secondary'].includes(fact.verification)) say(exam, `"${fact.label}" has no verification state`)
    }
  }

  // Scope labels: each points at a real topic, once, with a source.
  const seen = new Set<string>()
  for (const s of input.scope) {
    const where = `${s.lessonId} topic ${s.topic + 1}`
    const course = input.curricula.find((c) => c.lessons.some((l) => l.id === s.lessonId))
    const lesson = course?.lessons.find((l) => l.id === s.lessonId)
    if (!lesson || lesson.topics[s.topic] === undefined) say('scope', `${where} does not exist`)
    if (seen.has(where)) say('scope', `${where} is classified twice`)
    seen.add(where)
    if (s.sources.length === 0) say('scope', `${where} has no source`)
  }

  return problems
}

/** The course view the site reads. Throws if the data is inconsistent. */
export function buildCourses(input: CurriculumInput): Course[] {
  const problems = validateCurriculum(input)
  if (problems.length > 0) throw new Error(`Curriculum data is inconsistent:\n  ${problems.join('\n  ')}`)

  return input.curricula.map((c) => {
    const objectives = input.objectives[c.slug]
    const lessons: Lesson[] = c.lessons.map((l) => {
      const pending = pendingTopics(l)
      const lessonObjectives = objectives[l.id]
      const allApproved = lessonObjectives.every((o) => o.review === 'approved')
      return {
        id: l.id,
        courseSlug: c.slug,
        exam: c.exam,
        number: l.number,
        title: l.title,
        ...(l.clarification ? { clarification: l.clarification } : {}),
        topics: l.topics.map((text, i) => ({ text, display: displayTopic(text), confirmed: !pending.has(i) })),
        objectives: lessonObjectives,
        status: l.status,
        sections: LESSON_SECTIONS.map(({ key, label }) => ({
          key,
          label,
          state: key === 'topics' ? 'available' : key === 'objectives' ? (allApproved ? 'available' : 'draft') : 'planned',
        })),
        hasMock: MOCK.test(l.title) || l.topics.some((t) => MOCK.test(t)),
      }
    })
    const { hoursPerLesson, quizzes, mocks } = c.delivery
    return {
      ...c,
      lessons,
      hours: { min: hoursPerLesson.min * lessons.length, max: hoursPerLesson.max * lessons.length },
      assessment: {
        homeworkSets: lessons.length,
        quizzes,
        mocks,
        mockLessons: lessons.filter((l) => l.hasMock).map((l) => l.number),
      },
      format: input.formats[c.exam],
      scope: input.scope.filter((s) => lessons.some((l) => l.id === s.lessonId)),
    }
  })
}
