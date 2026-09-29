import type { HomeworkRecord, SessionRecord, StudentRecord, TopicResult } from './types'

/**
 * What a record *means* — pure functions over a StudentRecord, shared by the
 * real portals and the preview. Nothing here invents a value: where there is
 * nothing to count, the answer is null or an empty list, and the page says
 * so rather than showing a zero that looks like a result.
 */

/** Today in Cairo, as YYYY-MM-DD — the day every session is scheduled in. */
export function cairoToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** The day this record is read as of. */
export function viewDate(record: StudentRecord): string {
  return record.asOf ?? cairoToday()
}

export function attendanceRate(record: StudentRecord): { attended: number; held: number; rate: number } {
  const held = record.sessions.filter((s) => s.status === 'attended' || s.status === 'missed').length
  const attended = record.sessions.filter((s) => s.status === 'attended').length
  return { attended, held, rate: held ? Math.round((attended / held) * 100) : 0 }
}

export function homeworkRate(record: StudentRecord): { done: number; due: number; rate: number } {
  const due = record.homework.filter((h) => h.status !== 'pending').length
  const done = record.homework.filter((h) => h.status === 'completed' || h.status === 'late').length
  return { done, due, rate: due ? Math.round((done / due) * 100) : 0 }
}

export function quizAverage(record: StudentRecord): number {
  if (record.quizzes.length === 0) return 0
  const total = record.quizzes.reduce((sum, q) => sum + (q.total ? q.score / q.total : 0), 0)
  return Math.round((total / record.quizzes.length) * 100)
}

export function latestMock(record: StudentRecord) {
  return record.mocks[record.mocks.length - 1]
}

export function mockTrend(record: StudentRecord): number | null {
  if (record.mocks.length < 2) return null
  const last = record.mocks[record.mocks.length - 1]
  const prev = record.mocks[record.mocks.length - 2]
  return last.score - prev.score
}

function byDateTime(a: SessionRecord, b: SessionRecord) {
  return a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
}

/** Scheduled sessions, soonest first. */
export function upcomingSessions(record: StudentRecord): SessionRecord[] {
  return record.sessions.filter((s) => s.status === 'upcoming').sort(byDateTime)
}

/**
 * Scheduled sessions from today on. A scheduled session in the past that was
 * never marked attended or missed is not "next" — it is stale, and the owner
 * sees it in the admin area rather than the student seeing it as upcoming.
 */
export function comingSessions(record: StudentRecord): SessionRecord[] {
  const today = viewDate(record)
  return upcomingSessions(record).filter((s) => s.date >= today)
}

const ASSESSMENT = /quiz|mock|test|exam|diagnostic/i

/** Coming sessions that are assessments — a quiz or mock on the calendar. */
export function upcomingAssessments(record: StudentRecord): SessionRecord[] {
  return comingSessions(record).filter((s) => ASSESSMENT.test(s.stage) || ASSESSMENT.test(s.topic))
}

export type OutstandingHomework = HomeworkRecord & { overdue: boolean }

/** Homework still to hand in, overdue first, then by due date. */
export function outstandingHomework(record: StudentRecord): OutstandingHomework[] {
  const today = viewDate(record)
  return record.homework
    .filter((h) => h.status === 'pending')
    .map((h) => ({ ...h, overdue: h.dueOn < today }))
    .sort((a, b) => (a.overdue === b.overdue ? a.dueOn.localeCompare(b.dueOn) : a.overdue ? -1 : 1))
}

export type ResultEntry = {
  id: string
  kind: 'quiz' | 'mock'
  title: string
  date: string
  score: number
  total: number
  percent: number
}

/** The latest quiz and mock results together, newest first. */
export function recentResults(record: StudentRecord, limit = 4): ResultEntry[] {
  const entries: ResultEntry[] = [
    ...record.quizzes.map((q) => ({
      id: q.id, kind: 'quiz' as const, title: q.title, date: q.date, score: q.score, total: q.total,
      percent: q.total ? Math.round((q.score / q.total) * 100) : 0,
    })),
    ...record.mocks.map((m) => ({
      id: m.id, kind: 'mock' as const, title: m.label, date: m.date, score: m.score, total: m.total,
      percent: m.total ? Math.round((m.score / m.total) * 100) : 0,
    })),
  ]
  return entries.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
}

export function topicsByStatus(record: StudentRecord, status: TopicResult['status']) {
  return record.topics.filter((t) => t.status === status).sort((a, b) => b.score - a.score)
}

/** Topics to work on: weak ones first (lowest score first), then developing. */
export function focusTopics(record: StudentRecord, limit = 4): TopicResult[] {
  const weak = record.topics.filter((t) => t.status === 'weak').sort((a, b) => a.score - b.score)
  const developing = record.topics.filter((t) => t.status === 'developing').sort((a, b) => a.score - b.score)
  return [...weak, ...developing].slice(0, limit)
}

export type NextAction = {
  /** Short imperative headline. */
  title: string
  detail: string
  /** Portal-relative path segment ('' for overview). */
  section: '' | 'homework' | 'sessions' | 'quizzes' | 'mocks' | 'journey'
  tone: 'alert' | 'sky' | 'growth' | 'neutral'
}

/**
 * The single most useful thing to do next, chosen from the record in a fixed
 * order: overdue work, then work due before the next session, then what to
 * prepare for that session, then the latest written next step. Returns null
 * when the record gives nothing to act on — the page does not make one up.
 */
export function nextAction(record: StudentRecord): NextAction | null {
  const outstanding = outstandingHomework(record)
  const next = comingSessions(record)[0]

  const overdue = outstanding.filter((h) => h.overdue)
  if (overdue.length) {
    const first = overdue[0]
    return {
      title: `Hand in “${first.title}”`,
      detail:
        overdue.length === 1
          ? 'It is past its due date. Submit it before anything new.'
          : `It is past its due date, with ${overdue.length - 1} more overdue set${overdue.length === 2 ? '' : 's'}. Clear these before anything new.`,
      section: 'homework',
      tone: 'alert',
    }
  }

  const dueSoon = outstanding.find((h) => !next || h.dueOn <= next.date)
  if (dueSoon) {
    return {
      title: `Finish “${dueSoon.title}”`,
      detail: next ? 'It is due before your next session.' : 'It is the next set due.',
      section: 'homework',
      tone: 'sky',
    }
  }

  if (next?.prepare) {
    return { title: 'Prepare for your next session', detail: next.prepare, section: 'sessions', tone: 'sky' }
  }

  const step = record.feedback.find((f) => f.next)?.next ?? record.reviews.find((r) => r.next)?.next
  if (step) {
    return { title: 'Your latest next step', detail: step, section: 'quizzes', tone: 'growth' }
  }

  if (outstanding.length) {
    const first = outstanding[0]
    return { title: `Work on “${first.title}”`, detail: 'It is the next set due.', section: 'homework', tone: 'sky' }
  }

  return null
}
