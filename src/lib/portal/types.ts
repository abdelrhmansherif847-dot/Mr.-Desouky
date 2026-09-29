/**
 * Domain types for the student and parent portals.
 *
 * One contract for two sources: the anonymised sample behind /preview/*, and
 * real rows from Supabase behind /student and /parent (lib/portal/records).
 * Anything a teacher may not have entered yet is optional or nullable here,
 * so a new student's portal shows an honest empty state rather than a
 * default that looks like data.
 */

export type TopicStatus = 'strong' | 'developing' | 'weak'

export type TopicResult = {
  name: string
  /** Percentage correct across all attempts on this topic. */
  score: number
  attempts: number
  status: TopicStatus
}

export type SessionStatus = 'attended' | 'upcoming' | 'missed' | 'cancelled'

export type SessionRecord = {
  id: string
  date: string
  /** 'HH:MM', or '' when no time was set. */
  time: string
  topic: string
  /** The kind of session (lesson, review, mock debrief…) — shown as a label. */
  stage: string
  status: SessionStatus
  prepare?: string
  notes?: string
}

export type HomeworkStatus = 'completed' | 'pending' | 'late' | 'missed'

export type HomeworkRecord = {
  id: string
  title: string
  description?: string
  topic: string
  setOn: string
  dueOn: string
  status: HomeworkStatus
  /** 0–100 while the work is in progress. */
  progress?: number
  score?: number
  note?: string
}

export type QuizRecord = {
  id: string
  title: string
  date: string
  score: number
  total: number
  topics: { name: string; correct: number; total: number }[]
}

export type ReviewRecord = {
  id: string
  quizId?: string
  title?: string
  date: string
  summary: string
  /** Errors grouped by cause — the point of a review. May be empty. */
  causes: { label: string; count: number }[]
  next: string
}

export type MockRecord = {
  id: string
  label: string
  date: string
  score: number
  total: number
  exam?: 'SAT' | 'EST'
  modules: { name: string; correct: number; total: number; minutesUsed?: number; minutesAllowed?: number }[]
  note: string
}

export type Achievement = {
  id: string
  title: string
  description: string
  earnedOn: string
  kind?: string
}

/**
 * Written feedback. The sample uses the full four-question form; real
 * feedback always has `what` (the message) and may add `next`. Components
 * show only the parts that exist.
 */
export type FeedbackNote = {
  id: string
  date: string
  source: string
  what: string
  why?: string
  improve?: string
  next?: string
}

export type StudentProfile = {
  id: string
  name: string
  programTitle: string | null
  exam: 'SAT' | 'EST' | null
  level: 'Basic' | 'Advanced' | null
  startedOn: string | null
  /** Index into JOURNEY_STAGES, 0-based. */
  currentStageIndex: number
  targetExamDate: string | null
  /** False until Mr. Desouky has set up this student's programme. */
  configured: boolean
}

export type StudentRecord = {
  profile: StudentProfile
  /**
   * The day the record is read as of (YYYY-MM-DD). Set only on the fixed
   * sample; a real record is read as of today in Cairo.
   */
  asOf?: string
  sessions: SessionRecord[]
  homework: HomeworkRecord[]
  quizzes: QuizRecord[]
  reviews: ReviewRecord[]
  mocks: MockRecord[]
  topics: TopicResult[]
  achievements: Achievement[]
  feedback: FeedbackNote[]
}

export type ParentRecord = {
  parentName: string
  children: StudentRecord[]
}

/** A linked child as a parent's chooser lists them: identity only. */
export type ChildSummary = { id: string; name: string }
