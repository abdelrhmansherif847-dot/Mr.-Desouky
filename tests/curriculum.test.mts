// Run with: npm test
//
// The six transcribed curricula (src/content/curriculum/): complete, in order,
// stably identified, kept to their own exam, and changed from the printed
// reference images only where the owner approved a correction.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { CourseCurriculum } from '../src/content/curriculum/types.ts'
import { SAT_MATH_BASIC } from '../src/content/curriculum/sat-math-basic.ts'
import { SAT_MATH_ADVANCED } from '../src/content/curriculum/sat-math-advanced.ts'
import { EST_MATH_BASIC } from '../src/content/curriculum/est-math-basic.ts'
import { EST_MATH_ADVANCED } from '../src/content/curriculum/est-math-advanced.ts'
import { ACT_MATH_BASIC } from '../src/content/curriculum/act-math-basic.ts'
import { ACT_MATH_ADVANCED } from '../src/content/curriculum/act-math-advanced.ts'

const COURSES: CourseCurriculum[] = [
  SAT_MATH_BASIC,
  SAT_MATH_ADVANCED,
  EST_MATH_BASIC,
  EST_MATH_ADVANCED,
  ACT_MATH_BASIC,
  ACT_MATH_ADVANCED,
]
const LESSONS = COURSES.flatMap((c) => c.lessons)

/** Every piece of text a course carries. */
function texts(course: CourseCurriculum): string[] {
  const d = course.details
  return [
    course.title,
    course.grade,
    course.strapline,
    ...course.slogans,
    d.lessons.length,
    d.quizzes.count,
    d.quizzes.when,
    d.mocks.format,
    d.homework,
    d.tracking,
    ...course.lessons.flatMap((l) => [l.title, ...(l.clarification ? [l.clarification] : []), ...l.topics]),
  ]
}

test('six courses: one per exam and level, slugs match', () => {
  assert.equal(COURSES.length, 6)
  assert.equal(new Set(COURSES.map((c) => `${c.exam} ${c.level}`)).size, 6)
  for (const c of COURSES) {
    assert.equal(c.slug, `${c.exam.toLowerCase()}-math-${c.level.toLowerCase()}`)
    assert.equal(c.title, `${c.exam} Math – ${c.level}`)
    assert.equal(c.grade, c.level === 'Basic' ? 'Grade 10' : 'Grade 11–12')
  }
})

test('24 lessons each, numbered 1–24 in order', () => {
  for (const c of COURSES) {
    assert.equal(c.lessons.length, 24, c.slug)
    c.lessons.forEach((lesson, i) => assert.equal(lesson.number, i + 1, `${c.slug} position ${i}`))
  }
  assert.equal(LESSONS.length, 144)
})

test('lesson ids are stable, well-formed and unique across all courses', () => {
  for (const c of COURSES) {
    const prefix = `${c.exam}-${c.level}`.toLowerCase()
    for (const l of c.lessons) assert.equal(l.id, `${prefix}-L${String(l.number).padStart(2, '0')}`)
  }
  assert.equal(new Set(LESSONS.map((l) => l.id)).size, 144)
})

test('every lesson has a title and at least one topic; text is tidy', () => {
  for (const c of COURSES) {
    for (const t of texts(c)) {
      assert.ok(t.length > 0, `${c.slug}: empty text`)
      assert.equal(t, t.trim(), `${c.slug}: untrimmed "${t}"`)
      assert.ok(!/\s{2}/.test(t), `${c.slug}: double space in "${t}"`)
    }
  }
  for (const l of LESSONS) {
    assert.ok(l.topics.length >= 1, l.id)
    for (const t of [l.title, ...l.topics]) assert.ok(!/[,.]$/.test(t), `${l.id}: trailing punctuation in "${t}"`)
  }
})

test('nothing is published: no lesson has teaching content yet', () => {
  for (const l of LESSONS) assert.equal(l.status, 'planned', l.id)
})

test('each course names only its own exam', () => {
  for (const c of COURSES) {
    const others = (['SAT', 'EST', 'ACT'] as const).filter((e) => e !== c.exam)
    for (const t of texts(c)) {
      for (const other of others) assert.ok(!new RegExp(`\\b${other}\\b`).test(t), `${c.slug} mentions ${other}: "${t}"`)
    }
  }
})

test('every course: 24 lessons of 1.5–2 hours, 4–6 quizzes, 3 timed mocks in its own exam style', () => {
  for (const c of COURSES) {
    const d = c.details
    assert.equal(d.lessons.count, c.lessons.length, c.slug)
    assert.equal(d.lessons.length, '1.5–2 hours each', c.slug)
    assert.equal(d.quizzes.count, '4–6', c.slug)
    assert.equal(d.mocks.count, 3, c.slug)
    assert.match(d.mocks.format, /timed/i, c.slug)
    assert.ok(d.mocks.format.includes(c.exam), `${c.slug} mock format`)
    assert.equal(d.homework, 'After every lesson', c.slug)
  }
  // Only SAT Basic's image has no "Course Details" strip; the owner set it.
  assert.deepEqual(COURSES.filter((c) => c.details.from === 'owner').map((c) => c.slug), ['sat-math-basic'])
})

test('SAT Basic ends at lesson 24, "Data – Graphs and Tables": no lesson is invented', () => {
  assert.equal(SAT_MATH_BASIC.lessons.at(-1)?.title, 'Data – Graphs and Tables')
})

test('approved corrections are applied, and the printed original is kept beside each', () => {
  for (const l of LESSONS) {
    for (const n of l.notes ?? []) {
      const text = l.topics[n.at]
      assert.ok(text !== undefined, `${l.id}: note points at topic ${n.at}, which does not exist`)
      if (n.kind === 'joined') {
        assert.equal(n.decision, 'applied', l.id)
        assert.equal(n.printed.split(' | ').join(' '), text, l.id)
      } else if (n.decision === 'applied') {
        assert.ok(n.proposed && n.proposed !== n.printed, `${l.id}: an applied note needs its correction`)
        assert.equal(text, n.proposed, `${l.id}: approved correction not applied`)
      } else {
        assert.equal(text, n.printed, `${l.id}: unconfirmed reading must stay as printed`)
      }
    }
  }
  const applied = LESSONS.flatMap((l) =>
    (l.notes ?? []).filter((n) => n.kind !== 'joined' && n.decision === 'applied').map((n) => `${l.id}: ${l.topics[n.at]}`),
  )
  assert.deepEqual(applied, [
    'sat-basic-L08: Solving quadratic equations',
    'est-advanced-L01: Complex fractions',
    'est-advanced-L15: Trig identities and equations',
    'est-advanced-L15: Sum/difference formulas',
    'act-advanced-L16: regression',
    'act-advanced-L17: Modeling, multi-step',
    'act-advanced-L21: Real past questions',
  ])
})

test('four readings stay as printed until the teacher confirms them', () => {
  const pending = LESSONS.flatMap((l) =>
    (l.notes ?? []).filter((n) => n.decision === 'teacher-check').map((n) => `${l.id}: ${l.topics[n.at]}`),
  )
  assert.deepEqual(pending, [
    'est-advanced-L01: Probiemunhitgure',
    'est-advanced-L14: Applications andgations',
    'act-basic-L02: like terms',
    'act-advanced-L12: identities ideations',
  ])
})

test('official titles are kept; only the two approved titles carry a clarification', () => {
  const clarified = LESSONS.filter((l) => l.clarification).map((l) => [l.id, l.title, l.clarification])
  assert.deepEqual(clarified, [
    ['sat-basic-L03', 'Polynomials and Complex', 'Complex here means complex numbers.'],
    ['sat-basic-L22', 'Ratio and Proportional', 'Ratios, proportions and proportional relationships.'],
  ])
})
