// Run with: npm test
//
// The course model (src/content/curriculum/model.ts): the six courses built
// from the data files, the draft objectives, the separate exam formats and
// the proposed SAT topic scope. Also proves the validator rejects each kind
// of inconsistency, using broken copies of the real data.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { CurriculumInput } from '../src/content/curriculum/model.ts'
import {
  LESSON_SECTIONS,
  OBJECTIVE_REVIEW_LABEL,
  VERIFICATION_LABEL,
  buildCourses,
  displayTopic,
  shownScope,
  validateCurriculum,
  visibleFacts,
} from '../src/content/curriculum/model.ts'
import { EXAM_FORMATS, SAT_TOPIC_SCOPE } from '../src/content/curriculum/exams.ts'
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

/** The same input the site builds from (src/content/curriculum/index.ts). */
const INPUT: CurriculumInput = {
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
}
const COURSES = buildCourses(INPUT)
const LESSONS = COURSES.flatMap((c) => c.lessons)
const bySlug = (slug: string) => COURSES.find((c) => c.slug === slug)!

/** A deep copy to break on purpose. */
const copy = (): CurriculumInput => structuredClone(INPUT)
const hasProblem = (input: CurriculumInput, pattern: RegExp) =>
  validateCurriculum(input).some((p) => pattern.test(p))

test('the real data has no problems', () => {
  assert.deepEqual(validateCurriculum(INPUT), [])
})

test('six courses, 144 lessons, each lesson knows its course and exam', () => {
  assert.deepEqual(
    COURSES.map((c) => c.slug),
    ['sat-math-basic', 'sat-math-advanced', 'est-math-basic', 'est-math-advanced', 'act-math-basic', 'act-math-advanced'],
  )
  assert.equal(LESSONS.length, 144)
  for (const c of COURSES) {
    for (const l of c.lessons) {
      assert.equal(l.courseSlug, c.slug)
      assert.equal(l.exam, c.exam)
    }
  }
})

test('duration and assessment: 36–48 teaching hours, 24 homework sets, 4–6 quizzes, 3 timed mocks', () => {
  for (const c of COURSES) {
    assert.deepEqual(c.hours, { min: 36, max: 48 }, c.slug)
    assert.equal(c.assessment.homeworkSets, 24, c.slug)
    assert.deepEqual([c.assessment.quizzes.min, c.assessment.quizzes.max], [4, 6], c.slug)
    assert.equal(c.assessment.mocks.count, 3, c.slug)
  }
})

test('mock exams inside lessons come only from the approved lesson text', () => {
  assert.deepEqual(
    Object.fromEntries(COURSES.map((c) => [c.slug, c.assessment.mockLessons])),
    {
      'sat-math-basic': [],
      'sat-math-advanced': [24],
      'est-math-basic': [24],
      'est-math-advanced': [24],
      'act-math-basic': [24],
      'act-math-advanced': [23, 24],
    },
  )
})

test('each course carries its own exam format, kept separate', () => {
  for (const c of COURSES) assert.equal(c.format.exam, c.exam, c.slug)
  assert.deepEqual(Object.keys(EXAM_FORMATS).sort(), ['ACT', 'EST', 'SAT'])
  for (const [exam, f] of Object.entries(EXAM_FORMATS)) {
    assert.equal(f.exam, exam)
    for (const fact of f.facts) assert.ok(fact.sources.length > 0, `${exam} ${fact.label}`)
  }
})

test('course targets: both EST courses prepare for EST I; SAT and ACT courses for their own test', () => {
  assert.deepEqual(Object.fromEntries(COURSES.map((c) => [c.slug, c.target])), {
    'sat-math-basic': 'SAT',
    'sat-math-advanced': 'SAT',
    'est-math-basic': 'EST I',
    'est-math-advanced': 'EST I',
    'act-math-basic': 'ACT',
    'act-math-advanced': 'ACT',
  })
  for (const c of COURSES) assert.ok(c.format.covers.includes(c.target), `${c.slug}: format does not describe ${c.target}`)
})

test('the EST format describes EST I only, and every fact is Pending Official Verification', () => {
  const est = EXAM_FORMATS.EST
  assert.deepEqual(est.covers, ['EST I'])
  assert.equal(est.mathTest, 'EST I Math section')
  for (const label of ['Sections', 'Math questions', 'Math time', 'Calculator', 'Scoring']) {
    assert.ok(est.facts.some((f) => f.label === label), `EST format has no "${label}" fact`)
  }
  for (const fact of est.facts) {
    assert.notEqual(fact.verification, 'confirmed', fact.label)
    assert.equal(VERIFICATION_LABEL[fact.verification], 'Pending Official Verification', fact.label)
    assert.ok(!/EST II/.test(`${fact.label} ${fact.value}`), `"${fact.label}" describes EST II`)
  }
  assert.deepEqual(visibleFacts(est), [])
})

test('no exam fact is shown until it is confirmed in the original', () => {
  for (const f of Object.values(EXAM_FORMATS)) assert.deepEqual(visibleFacts(f), [], f.exam)
  const confirmed = structuredClone(EXAM_FORMATS.ACT)
  confirmed.facts[0].verification = 'confirmed'
  assert.equal(visibleFacts(confirmed).length, 1)
})

test('every lesson has the eleven sections; only topics and draft objectives have content', () => {
  for (const l of LESSONS) {
    assert.deepEqual(l.sections.map((s) => s.key), LESSON_SECTIONS.map((s) => s.key), l.id)
    for (const s of l.sections) {
      const expected = s.key === 'topics' ? 'available' : s.key === 'objectives' ? 'draft' : 'planned'
      assert.equal(s.state, expected, `${l.id} ${s.key}`)
    }
  }
})

test('every objective is a draft pending teacher review', () => {
  assert.equal(OBJECTIVE_REVIEW_LABEL.draft, 'Draft — Pending Teacher Review')
  for (const l of LESSONS) {
    assert.ok(l.objectives.length > 0, l.id)
    for (const o of l.objectives) assert.equal(o.review, 'draft', `${l.id}: ${o.text}`)
  }
})

test('the four unconfirmed readings stay unconfirmed, and no objective is drawn from them', () => {
  const pending = LESSONS.flatMap((l) => l.topics.map((t, i) => ({ l, t, i })).filter(({ t }) => !t.confirmed))
  assert.deepEqual(
    pending.map(({ l, t }) => `${l.id}: ${t.text}`),
    [
      'est-advanced-L01: Probiemunhitgure',
      'est-advanced-L14: Applications andgations',
      'act-basic-L02: like terms',
      'act-advanced-L12: identities ideations',
    ],
  )
  for (const { l, i } of pending) {
    for (const o of l.objectives) assert.ok(!o.from.includes(i), `${l.id}: "${o.text}"`)
  }
})

test('display capitalises the first letter; the stored text keeps the printed case', () => {
  const l = bySlug('est-math-advanced').lessons[8]
  assert.equal(l.topics[0].text, 'log rules')
  assert.equal(l.topics[0].display, 'Log rules')
  assert.equal(displayTopic('3-variable systems'), '3-variable systems')
})

test('SAT Advanced scope is a proposal: every classified topic still exists, nothing is shown yet', () => {
  const sat = bySlug('sat-math-advanced')
  assert.equal(sat.scope.length, SAT_TOPIC_SCOPE.length)
  for (const c of COURSES) if (c.slug !== 'sat-math-advanced') assert.deepEqual(c.scope, [], c.slug)
  assert.deepEqual([...new Set(SAT_TOPIC_SCOPE.map((s) => s.lessonId))], [
    'sat-advanced-L06',
    'sat-advanced-L10',
    'sat-advanced-L12',
    'sat-advanced-L14',
  ])
  for (const s of SAT_TOPIC_SCOPE) {
    const lesson = sat.lessons.find((l) => l.id === s.lessonId)!
    assert.ok(lesson.topics[s.topic], `${s.lessonId} topic ${s.topic + 1}`)
    assert.equal(s.review, 'pending')
  }
  assert.deepEqual(shownScope(SAT_TOPIC_SCOPE), [])
})

/* The validator rejects each kind of problem. */

test('rejects an objective drawn from a topic that awaits the teacher', () => {
  const bad = copy()
  bad.objectives['act-math-basic']['act-basic-L02'].push({ text: 'Combine like terms', from: [2], review: 'draft' })
  assert.ok(hasProblem(bad, /act-basic-L02: objective "Combine like terms" is drawn from "like terms", which awaits the teacher/))
})

test('rejects a confirmed topic with no objective, and objectives for an unknown lesson', () => {
  const bad = copy()
  bad.objectives['sat-math-basic']['sat-basic-L02'].pop()
  bad.objectives['sat-math-basic']['sat-basic-L25'] = [{ text: 'Extra', from: [0], review: 'draft' }]
  assert.ok(hasProblem(bad, /sat-basic-L02: topic "Scientific notation" has no objective/))
  assert.ok(hasProblem(bad, /objectives for unknown lesson sat-basic-L25/))
})

test('rejects an objective pointing at a topic that does not exist', () => {
  const bad = copy()
  bad.objectives['est-math-basic']['est-basic-L01'][0].from = [7]
  assert.ok(hasProblem(bad, /est-basic-L01: objective .* points at topic 8, which does not exist/))
})

test('rejects one exam named inside another exam’s course', () => {
  const bad = copy()
  bad.objectives['act-math-advanced']['act-advanced-L20'][0].text = 'Answer mixed SAT questions'
  bad.curricula[2].lessons[0].topics[0] = 'Integers, fractions, decimals for the ACT'
  assert.ok(hasProblem(bad, /names SAT in a ACT course/))
  assert.ok(hasProblem(bad, /names ACT in a EST course/))
})

test('rejects a published lesson, a missing lesson and a wrong order', () => {
  const bad = copy()
  bad.curricula[0].lessons[0].status = 'published'
  bad.curricula[1].lessons.pop()
  ;[bad.curricula[2].lessons[0], bad.curricula[2].lessons[1]] = [bad.curricula[2].lessons[1], bad.curricula[2].lessons[0]]
  assert.ok(hasProblem(bad, /sat-basic-L01: published, but no teaching content exists yet/))
  assert.ok(hasProblem(bad, /sat-math-advanced: 23 lessons, not 24/))
  assert.ok(hasProblem(bad, /est-basic-L02: number 2 at position 1/))
})

test('rejects an applied correction that is not in the text, and a guess slipped in', () => {
  const bad = copy()
  bad.curricula[5].lessons[20].topics[0] = 'Feal past questions'
  bad.curricula[3].lessons[13].topics[1] = 'Applications and equations'
  assert.ok(hasProblem(bad, /act-advanced-L21: approved correction "Real past questions" is not applied/))
  assert.ok(hasProblem(bad, /est-advanced-L14: "Applications and equations" awaits the teacher, so it must stay as printed/))
})

test('rejects an exam fact without a source, and a scope label for a missing topic', () => {
  const bad = copy()
  bad.formats.EST.facts[0].sources = []
  bad.scope = [...bad.scope, { ...bad.scope[0], topic: 9 }]
  assert.ok(hasProblem(bad, /EST: "What it is" has no source/))
  assert.ok(hasProblem(bad, /scope: sat-advanced-L06 topic 10 does not exist/))
})

test('rejects a course aimed at another exam’s test, or at a test its format does not describe', () => {
  const wrongExam = copy()
  wrongExam.curricula[2].target = 'ACT'
  assert.ok(hasProblem(wrongExam, /est-math-basic: target "ACT" is not a EST test/))

  const undescribed = copy()
  undescribed.formats.EST.covers = []
  assert.ok(hasProblem(undescribed, /est-math-basic: the EST format does not describe its target, EST I/))
  assert.ok(hasProblem(undescribed, /est-math-advanced: the EST format does not describe its target, EST I/))

  const crossed = copy()
  crossed.formats.EST.covers = ['EST I', 'SAT']
  assert.ok(hasProblem(crossed, /EST format covers SAT, another exam's test/))
})

test('buildCourses refuses inconsistent data instead of building it', () => {
  const bad = copy()
  bad.curricula[0].lessons[3].topics = []
  assert.throws(() => buildCourses(bad), /Curriculum data is inconsistent:[\s\S]*sat-basic-L04: has no topics/)
})
