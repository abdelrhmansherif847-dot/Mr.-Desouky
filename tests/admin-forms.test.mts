// Run with: npm test
//
// What the owner's record forms accept (src/lib/admin/forms.ts) — the same
// limits the database enforces, with a message on the one field at fault.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  RECORDS,
  TRANSITIONS,
  accountErrorMessage,
  canMove,
  isRecordKind,
  isUuid,
  parseRecord,
} from '../src/lib/admin/forms.ts'

const session = {
  session_date: '2026-10-01',
  start_time: '17:00',
  duration_minutes: '120',
  kind: 'Lesson',
  topic: 'Linear equations',
  status: 'scheduled',
  preparation: '',
  notes: '',
}

test('a valid session parses to typed values; blanks become null', () => {
  const r = parseRecord('sessions', session)
  assert.equal(r.ok, true)
  if (!r.ok) return
  assert.equal(r.values.duration_minutes, 120)
  assert.equal(r.values.preparation, null)
  assert.equal(r.values.topic, 'Linear equations')
})

test('each error is attached to the field it is about', () => {
  const r = parseRecord('sessions', { ...session, topic: '  ', duration_minutes: '5', session_date: '2026-02-30' })
  assert.equal(r.ok, false)
  if (r.ok) return
  assert.deepEqual(Object.keys(r.errors).sort(), ['duration_minutes', 'session_date', 'topic'])
  assert.match(r.errors.topic, /required/)
  assert.match(r.errors.duration_minutes, /at least 15/)
  assert.match(r.errors.session_date, /real date/)
})

test('only listed options are accepted for enums', () => {
  const r = parseRecord('sessions', { ...session, status: 'deleted', kind: 'Party' })
  assert.equal(r.ok, false)
  if (!r.ok) {
    assert.ok(r.errors.status)
    assert.ok(r.errors.kind)
  }
  const f = parseRecord('feedback', { category: 'General', given_on: '2026-10-01', message: 'x', next_step: '', visibility: 'everyone' })
  assert.equal(f.ok, false)
})

test('lengths match the database limits', () => {
  const r = parseRecord('sessions', { ...session, topic: 'x'.repeat(161) })
  assert.equal(r.ok, false)
  assert.equal(parseRecord('sessions', { ...session, topic: 'x'.repeat(160) }).ok, true)
})

test('cross-field rules: score within total, due after set', () => {
  const quiz = parseRecord('quizzes', { title: 'Q', taken_on: '2026-10-01', score: '11', total: '10', notes: '' })
  assert.equal(quiz.ok, false)
  if (!quiz.ok) assert.match(quiz.errors.score, /more than the total/)
  const topic = parseRecord('quiz_topic_results', { topic: 'T', correct: '6', total: '5' })
  assert.equal(topic.ok, false)
  const hw = parseRecord('homework', {
    title: 'H', topic: '', description: '', assigned_on: '2026-10-05', due_on: '2026-10-01',
    status: 'assigned', progress: '0', score: '', feedback: '',
  })
  assert.equal(hw.ok, false)
  if (!hw.ok) assert.match(hw.errors.due_on, /before/)
})

test('numbers: whole numbers only where required; decimals to two places', () => {
  assert.equal(parseRecord('quizzes', { title: 'Q', taken_on: '2026-10-01', score: '7.5', total: '10', notes: '' }).ok, false)
  const base = { title: 'H', topic: '', description: '', assigned_on: '2026-10-01', due_on: '2026-10-02', status: 'completed', progress: '100', feedback: '' }
  assert.equal(parseRecord('homework', { ...base, score: '88.25' }).ok, true)
  assert.equal(parseRecord('homework', { ...base, score: '88.255' }).ok, false)
  assert.equal(parseRecord('homework', { ...base, score: '101' }).ok, false)
})

test('unknown keys are ignored — only listed columns can be written', () => {
  const r = parseRecord('achievements', {
    title: 'A', kind: 'Milestone', earned_on: '2026-10-01', description: '',
    student_id: 'someone-else', id: 'x', created_at: 'now',
  } as Record<string, string>)
  assert.equal(r.ok, true)
  if (r.ok) assert.deepEqual(Object.keys(r.values).sort(), ['description', 'earned_on', 'kind', 'title'])
})

test('a review may only reference a quiz by id', () => {
  const base = { title: 'R', reviewed_on: '2026-10-01', content: 'c', next_step: '', status: 'draft' }
  assert.equal(parseRecord('reviews', { ...base, quiz_id: '' }).ok, true)
  assert.equal(parseRecord('reviews', { ...base, quiz_id: "1' or '1'='1" }).ok, false)
})

test('the journey stage is stored as a number 0–6', () => {
  const r = parseRecord('student_profiles', { exam: 'SAT', level: '', program_title: '', started_on: '', current_stage: '3', target_exam_date: '' })
  assert.equal(r.ok, true)
  if (r.ok) assert.equal(r.values.current_stage, 3)
  assert.equal(parseRecord('student_profiles', { current_stage: '7' }).ok, false)
})

test('record kinds and ids are checked before anything else', () => {
  assert.equal(isRecordKind('sessions'), true)
  assert.equal(isRecordKind('profiles'), false)
  assert.equal(isRecordKind('__proto__'), false)
  assert.equal(isUuid('00000000-0000-4000-8000-000000000001'), true)
  assert.equal(isUuid('00000000-0000-4000-8000-000000000001; drop'), false)
})

test('every spec names only real, distinct columns and never the owner key', () => {
  for (const [kind, spec] of Object.entries(RECORDS)) {
    const names = spec.fields.map((f) => f.name)
    assert.equal(new Set(names).size, names.length, kind)
    for (const forbidden of ['id', 'student_id', 'quiz_id_owner', 'created_at', 'updated_at', 'role', 'status_owner']) {
      assert.equal(names.includes(forbidden), false, `${kind} exposes ${forbidden}`)
    }
    for (const name of names) assert.equal(name.startsWith('_'), false, `${kind}.${name} collides with control fields`)
  }
})

test('account status moves: exactly the four allowed', () => {
  assert.deepEqual(TRANSITIONS, { pending: ['approved', 'suspended'], approved: ['suspended'], suspended: ['approved'] })
  assert.equal(canMove('pending', 'approved'), true)
  assert.equal(canMove('pending', 'suspended'), true)
  assert.equal(canMove('approved', 'suspended'), true)
  assert.equal(canMove('suspended', 'approved'), true)
  assert.equal(canMove('approved', 'pending'), false)
  assert.equal(canMove('suspended', 'pending'), false)
})

test('database error codes become the owner’s words, never raw errors', () => {
  assert.match(accountErrorMessage('42501'), /Only the owner/)
  assert.match(accountErrorMessage('23514'), /links/)
  assert.equal(accountErrorMessage('XX000'), 'That did not save. Try again in a moment.')
  assert.equal(accountErrorMessage(undefined), 'That did not save. Try again in a moment.')
})
