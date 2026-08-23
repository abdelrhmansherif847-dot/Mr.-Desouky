/** Domain types for the student and parent portals. */

export type TopicStatus = 'strong' | 'developing' | 'weak'

export type TopicResult = {
  name: string
  /** Percentage correct across all attempts on this topic. */
  score: number
  attempts: number
  status: TopicStatus
}

export type SessionStatus = 'attended' | 'upcoming' | 'missed'

export type SessionRecord = {
  id: string
  date: string
  time: string
  topic: string
  stage: string
  status: SessionStatus
  prepare?: string
}

export type HomeworkStatus = 'completed' | 'pending' | 'late' | 'missed'

export type HomeworkRecord = {
  id: string
  title: string
  topic: string
  setOn: string
  dueOn: string
  status: HomeworkStatus
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
  quizId: string
  date: string
  summary: string
  /** Errors grouped by cause — the point of a review. */
  causes: { label: string; count: number }[]
  next: string
}

export type MockRecord = {
  id: string
  label: string
  date: string
  score: number
  total: number
  modules: { name: string; correct: number; total: number; minutesUsed: number; minutesAllowed: number }[]
  note: string
}

export type Achievement = {
  id: string
  title: string
  description: string
  earnedOn: string
}

export type FeedbackNote = {
  id: string
  date: string
  source: string
  what: string
  why: string
  improve: string
  next: string
}

export type StudentProfile = {
  id: string
  name: string
  programSlug: string
  programTitle: string
  exam: 'SAT' | 'EST'
  level: 'Basic' | 'Advanced'
  startedOn: string
  /** Index into JOURNEY_STAGES, 0-based. */
  currentStageIndex: number
  targetExamDate: string
}

export type StudentRecord = {
  profile: StudentProfile
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
