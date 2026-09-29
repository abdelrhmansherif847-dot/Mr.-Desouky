// Run with: npm test
//
// What the portals derive from a record (src/lib/portal/insights.ts). The
// rule throughout: nothing is invented — no data gives an empty answer.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  attendanceRate,
  cairoToday,
  comingSessions,
  deriveTopics,
  focusTopics,
  homeworkRate,
  nextAction,
  outstandingHomework,
  quizAverage,
  recentResults,
  upcomingAssessments,
} from '../src/lib/portal/insights.ts'
import type { StudentRecord } from '../src/lib/portal/types.ts'

function record(parts: Partial<StudentRecord> = {}): StudentRecord {
  return {
    profile: {
      id: 's', name: 'Student', programTitle: null, exam: null, level: null, startedOn: null,
      currentStageIndex: 0, targetExamDate: null, configured: false,
    },
    asOf: '2026-10-10',
    sessions: [], homework: [], quizzes: [], reviews: [], mocks: [], topics: [], achievements: [], feedback: [],
    ...parts,
  }
}
const session = (id: string, date: string, status: 'upcoming' | 'attended' | 'missed' | 'cancelled', extra = {}) =>
  ({ id, date, time: '17:00', topic: `Topic ${id}`, stage: 'Lesson', status, ...extra })
const hw = (id: string, dueOn: string, status: 'pending' | 'completed' | 'late' | 'missed' = 'pending') =>
  ({ id, title: `Set ${id}`, topic: 'Algebra', setOn: '2026-10-01', dueOn, status })

test('an empty record derives nothing — no zeros dressed up as results', () => {
  const r = record()
  assert.equal(attendanceRate(r).held, 0)
  assert.equal(homeworkRate(r).due, 0)
  assert.equal(quizAverage(r), 0)
  assert.deepEqual(recentResults(r), [])
  assert.deepEqual(focusTopics(r), [])
  assert.equal(nextAction(r), null)
})

test('attendance counts only sessions that were held', () => {
  const r = record({ sessions: [session('a', '2026-10-01', 'attended'), session('b', '2026-10-03', 'missed'), session('c', '2026-10-05', 'cancelled'), session('d', '2026-10-12', 'upcoming')] })
  assert.deepEqual(attendanceRate(r), { attended: 1, held: 2, rate: 50 })
})

test('coming sessions start today; stale scheduled ones are not "next"', () => {
  const r = record({ sessions: [session('old', '2026-10-01', 'upcoming'), session('today', '2026-10-10', 'upcoming'), session('later', '2026-10-15', 'upcoming')] })
  assert.deepEqual(comingSessions(r).map((s) => s.id), ['today', 'later'])
})

test('upcoming assessments are coming quiz or mock sessions', () => {
  const r = record({ sessions: [
    session('l', '2026-10-11', 'upcoming'),
    session('q', '2026-10-12', 'upcoming', { stage: 'Quiz' }),
    session('m', '2026-10-13', 'upcoming', { topic: 'Mock 2 — full section' }),
  ] })
  assert.deepEqual(upcomingAssessments(r).map((s) => s.id), ['q', 'm'])
})

test('outstanding homework: overdue first, then by due date', () => {
  const r = record({ homework: [hw('b', '2026-10-14'), hw('done', '2026-10-01', 'completed'), hw('a', '2026-10-12'), hw('late', '2026-10-05')] })
  const out = outstandingHomework(r)
  assert.deepEqual(out.map((h) => h.id), ['late', 'a', 'b'])
  assert.deepEqual(out.map((h) => h.overdue), [true, false, false])
})

test('next action: overdue work beats everything', () => {
  const r = record({ homework: [hw('late', '2026-10-05')], sessions: [session('n', '2026-10-11', 'upcoming', { prepare: 'Read' })] })
  const a = nextAction(r)
  assert.equal(a?.section, 'homework')
  assert.equal(a?.tone, 'alert')
  assert.match(a?.title ?? '', /Set late/)
})

test('next action: then work due before the next session, then preparation, then the written next step', () => {
  const due = record({ homework: [hw('soon', '2026-10-11')], sessions: [session('n', '2026-10-12', 'upcoming', { prepare: 'Read' })] })
  assert.match(nextAction(due)?.title ?? '', /Finish/)
  const prep = record({ homework: [hw('far', '2026-10-20')], sessions: [session('n', '2026-10-12', 'upcoming', { prepare: 'Read chapter 3' })] })
  assert.equal(nextAction(prep)?.detail, 'Read chapter 3')
  const step = record({ feedback: [{ id: 'f', date: '2026-10-01', source: 'Quiz', what: 'x', next: 'Redo set A' }] })
  assert.equal(nextAction(step)?.detail, 'Redo set A')
})

test('topics aggregate across quizzes into strong / developing / weak', () => {
  const topics = deriveTopics([
    { topic: 'Algebra', correct: 8, total: 10 },
    { topic: 'Algebra', correct: 9, total: 10 },
    { topic: 'Geometry', correct: 6, total: 10 },
    { topic: 'Data', correct: 2, total: 10 },
  ])
  const by = Object.fromEntries(topics.map((t) => [t.name, t]))
  assert.equal(by.Algebra.score, 85)
  assert.equal(by.Algebra.attempts, 20)
  assert.equal(by.Algebra.status, 'strong')
  assert.equal(by.Geometry.status, 'developing')
  assert.equal(by.Data.status, 'weak')
  assert.deepEqual(focusTopics(record({ topics })).map((t) => t.name), ['Data', 'Geometry'])
})

test('recent results merge quizzes and mocks, newest first', () => {
  const r = record({
    quizzes: [{ id: 'q1', title: 'Q1', date: '2026-10-01', score: 8, total: 10, topics: [] }],
    mocks: [{ id: 'm1', label: 'Mock 1', date: '2026-10-05', score: 600, total: 800, modules: [], note: '' }],
  })
  assert.deepEqual(recentResults(r).map((x) => `${x.kind}:${x.percent}`), ['mock:75', 'quiz:80'])
})

test('today is computed in Cairo, not UTC', () => {
  // 23:30 UTC on 9 Oct is already 10 Oct in Cairo (UTC+3 in summer time).
  assert.equal(cairoToday(new Date('2026-10-09T23:30:00Z')), '2026-10-10')
})
