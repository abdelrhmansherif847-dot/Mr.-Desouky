// Run with: npm test
//
// What the course pages say (src/lib/courses/present.ts): every sentence
// derived from the course model, the four unconfirmed readings never shown,
// no unverified exam facts, and each course kept to its own exam.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCourses } from '../src/content/curriculum/model.ts'
import { EXAM_FORMATS, SAT_TOPIC_SCOPE } from '../src/content/curriculum/exams.ts'
import { COURSE_OUTCOMES } from '../src/content/curriculum/outcomes.ts'
import { SAT_MATH_BASIC } from '../src/content/curriculum/sat-math-basic.ts'
import { SAT_MATH_ADVANCED } from '../src/content/curriculum/sat-math-advanced.ts'
import { EST_MATH_BASIC } from '../src/content/curriculum/est-math-basic.ts'
import { EST_MATH_ADVANCED } from '../src/content/curriculum/est-math-advanced.ts'
import { ACT_MATH_BASIC } from '../src/content/curriculum/act-math-basic.ts'
import { ACT_MATH_ADVANCED } from '../src/content/curriculum/act-math-advanced.ts'
import { SAT_MATH_BASIC_OBJECTIVES } from '../src/content/curriculum/objectives/sat-math-basic.ts'
import { SAT_MATH_ADVANCED_OBJECTIVES } from '../src/content/curriculum/objectives/sat-math-advanced.ts'
import { EST_MATH_BASIC_OBJECTIVES } from '../src/content/curriculum/objectives/est-math-basic.ts'
import { EST_MATH_ADVANCED_OBJECTIVES } from '../src/content/curriculum/objectives/est-math-advanced.ts'
import { ACT_MATH_BASIC_OBJECTIVES } from '../src/content/curriculum/objectives/act-math-basic.ts'
import { ACT_MATH_ADVANCED_OBJECTIVES } from '../src/content/curriculum/objectives/act-math-advanced.ts'
import { RESOURCES } from '../src/content/resources.ts'
import {
  EXAM_TONE,
  contactHref,
  courseFacts,
  courseSummary,
  enquiryMessage,
  finalReviewText,
  hiddenTopicCount,
  lessonRefs,
  prerequisites,
  publicTopics,
  relatedCourses,
  resourcesFor,
  straplineParts,
} from '../src/lib/courses/present.ts'

const COURSES = buildCourses({
  curricula: [SAT_MATH_BASIC, SAT_MATH_ADVANCED, EST_MATH_BASIC, EST_MATH_ADVANCED, ACT_MATH_BASIC, ACT_MATH_ADVANCED],
  objectives: {
    'sat-math-basic': SAT_MATH_BASIC_OBJECTIVES,
    'sat-math-advanced': SAT_MATH_ADVANCED_OBJECTIVES,
    'est-math-basic': EST_MATH_BASIC_OBJECTIVES,
    'est-math-advanced': EST_MATH_ADVANCED_OBJECTIVES,
    'act-math-basic': ACT_MATH_BASIC_OBJECTIVES,
    'act-math-advanced': ACT_MATH_ADVANCED_OBJECTIVES,
  },
  outcomes: COURSE_OUTCOMES,
  formats: EXAM_FORMATS,
  scope: SAT_TOPIC_SCOPE,
})
const bySlug = (slug: string) => COURSES.find((c) => c.slug === slug)!
const OTHER = { SAT: ['EST', 'ACT'], EST: ['SAT', 'ACT'], ACT: ['SAT', 'EST'] } as const

/** The four readings that wait for the teacher, and must never reach a page. */
const UNCONFIRMED = ['Probiemunhitgure', 'Applications andgations', 'Identities ideations', 'identities ideations']

test('the four unconfirmed readings are never among a lesson’s public topics', () => {
  for (const c of COURSES) {
    for (const l of c.lessons) {
      for (const t of publicTopics(l)) assert.ok(!UNCONFIRMED.includes(t), `${l.id}: "${t}"`)
    }
  }
  const actBasicL2 = bySlug('act-math-basic').lessons[1]
  assert.deepEqual(publicTopics(actBasicL2), ['Simplifying expressions', 'Distributive property'])
  assert.equal(hiddenTopicCount(actBasicL2), 1)
  const hidden = COURSES.flatMap((c) => c.lessons).reduce((n, l) => n + hiddenTopicCount(l), 0)
  assert.equal(hidden, 4)
})

test('public topics keep the approved wording, first letter capitalised', () => {
  const l9 = bySlug('est-math-advanced').lessons[8]
  assert.deepEqual(publicTopics(l9), ['Log rules', 'Solving logarithmic equations', 'Change of base'])
  assert.deepEqual(publicTopics(bySlug('act-math-advanced').lessons[20]), ['Real past questions', 'Pattern recognition'])
})

test('the course summary is built from the course data and names only its own exam', () => {
  const sat = bySlug('sat-math-basic')
  assert.equal(
    courseSummary(sat),
    'SAT Math – Basic is a 24-lesson course for Grade 10 students preparing for the SAT. It runs in order from ' +
      'Lesson 1, “Factoring & Use of Calculator”, to Lesson 24, “Data – Graphs and Tables”, with homework after ' +
      'every lesson, 4–6 quizzes after key lessons and 3 timed mock exams.',
  )
  assert.match(courseSummary(bySlug('est-math-advanced')), /Grade 11–12 students preparing for EST I\./)
  for (const c of COURSES) {
    for (const other of OTHER[c.exam]) assert.ok(!new RegExp(`\\b${other}\\b`).test(courseSummary(c)), c.slug)
  }
})

test('facts come from the delivery data: no session counts, weeks or exam formats', () => {
  for (const c of COURSES) {
    const facts = Object.fromEntries(courseFacts(c).map((f) => [f.label, f.value]))
    assert.equal(facts.Lessons, '24')
    assert.equal(facts['Lesson length'], '1.5–2 hours')
    assert.equal(facts['Teaching time'], '36–48 hours')
    assert.equal(facts.Quizzes, '4–6')
    assert.equal(facts['Mock exams'], '3 timed')
    const text = JSON.stringify(facts)
    assert.ok(!/session|week|minute|question|score/i.test(text), `${c.slug}: ${text}`)
  }
  assert.equal(Object.fromEntries(courseFacts(bySlug('est-math-basic')).map((f) => [f.label, f.value]))['Prepares for'], 'EST I')
})

test('prerequisites: grade, the Basic course for Advanced, and the diagnostic', () => {
  assert.deepEqual(
    prerequisites(bySlug('act-math-advanced'), COURSES).map((p) => [p.label, p.value, p.href]),
    [
      ['Grade', 'Grade 11–12', undefined],
      ['Follows on from', 'ACT Math – Basic', '/programs/act-math-basic'],
      ['Placement', 'Confirmed by the diagnostic assessment before the course starts', undefined],
    ],
  )
  assert.equal(prerequisites(bySlug('sat-math-basic'), COURSES).length, 2)
})

test('related courses: the other level first, then the same level in the other exams', () => {
  assert.deepEqual(relatedCourses(bySlug('est-math-basic'), COURSES).map((c) => c.slug), [
    'est-math-advanced',
    'sat-math-basic',
    'act-math-basic',
  ])
})

test('resources are matched to the exam and level, never another exam', () => {
  for (const c of COURSES) {
    for (const r of resourcesFor(c, RESOURCES)) {
      assert.ok(r.track === c.exam || r.track === 'All', `${c.slug}: ${r.id}`)
      assert.ok(r.level === c.level || r.level === 'All', `${c.slug}: ${r.id}`)
    }
  }
  assert.ok(resourcesFor(bySlug('sat-math-basic'), RESOURCES).some((r) => r.track === 'SAT'))
  assert.ok(!resourcesFor(bySlug('act-math-basic'), RESOURCES).some((r) => r.track === 'SAT' || r.track === 'EST'))
})

test('final review: in Lesson 24 where it is printed, in the assessment plan for SAT Basic', () => {
  assert.match(finalReviewText(bySlug('sat-math-basic')), /assessment plan rather than a numbered lesson/)
  assert.match(finalReviewText(bySlug('act-math-advanced')), /^Lesson 24, “Full-Length ACT Math Mock”/)
})

test('small helpers', () => {
  assert.equal(lessonRefs([11, 12, 13, 14, 22]), '11–14, 22')
  assert.equal(lessonRefs([10]), '10')
  assert.deepEqual(straplineParts('24 LESSONS • STRONGER BASICS • HIGHER SCORES'), ['STRONGER BASICS', 'HIGHER SCORES'])
  assert.deepEqual(EXAM_TONE, { SAT: 'sky', EST: 'olive', ACT: 'growth' })
  assert.equal(contactHref(bySlug('act-math-basic')), '/contact?course=act-math-basic')
  assert.equal(enquiryMessage(bySlug('sat-math-advanced')), 'Hello Mr. Desouky, I would like to ask about SAT Math – Advanced (Grade 11–12).')
})
