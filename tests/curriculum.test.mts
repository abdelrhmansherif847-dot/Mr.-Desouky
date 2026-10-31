// Run with: npm test
//
// The six transcribed curricula (src/content/curriculum/): complete, in order,
// stably identified, kept to their own exam, and with every proposed
// correction still unapplied until it is approved.

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

/** Every piece of text a course carries. */
function texts(course: CourseCurriculum): string[] {
  const d = course.details
  return [
    course.title,
    course.grade,
    course.strapline,
    ...course.slogans,
    ...(d ? [d.lessons.length, d.quizzes.count, d.quizzes.when, d.mocks.format, d.homework, d.tracking] : []),
    ...course.lessons.flatMap((l) => [l.title, ...l.topics]),
  ]
}

test('six courses: one per exam and level, slugs match', () => {
  assert.equal(COURSES.length, 6)
  const pairs = COURSES.map((c) => `${c.exam} ${c.level}`)
  assert.deepEqual(new Set(pairs).size, 6)
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
  assert.equal(COURSES.flatMap((c) => c.lessons).length, 144)
})

test('lesson ids are stable, well-formed and unique across all courses', () => {
  const ids = COURSES.flatMap((c) =>
    c.lessons.map((l) => {
      const prefix = `${c.exam}-${c.level}`.toLowerCase()
      assert.equal(l.id, `${prefix}-L${String(l.number).padStart(2, '0')}`)
      return l.id
    }),
  )
  assert.equal(new Set(ids).size, 144)
})

test('every lesson has a title and at least one topic; text is tidy', () => {
  for (const c of COURSES) {
    for (const l of c.lessons) assert.ok(l.topics.length >= 1, l.id)
    for (const t of texts(c)) {
      assert.ok(t.length > 0, `${c.slug}: empty text`)
      assert.equal(t, t.trim(), `${c.slug}: untrimmed "${t}"`)
      assert.ok(!/\s{2}/.test(t), `${c.slug}: double space in "${t}"`)
    }
    for (const l of c.lessons) {
      for (const t of [l.title, ...l.topics]) assert.ok(!/[,.]$/.test(t), `${l.id}: trailing punctuation in "${t}"`)
    }
  }
})

test('nothing is published: no lesson has teaching content yet', () => {
  for (const c of COURSES) for (const l of c.lessons) assert.equal(l.status, 'planned', l.id)
})

test('each course names only its own exam', () => {
  for (const c of COURSES) {
    const others = (['SAT', 'EST', 'ACT'] as const).filter((e) => e !== c.exam)
    for (const t of texts(c)) {
      for (const other of others) assert.ok(!new RegExp(`\\b${other}\\b`).test(t), `${c.slug} mentions ${other}: "${t}"`)
    }
    if (c.details) {
      assert.ok(c.details.mocks.format.includes(c.exam), `${c.slug} mock format`)
      assert.equal(c.details.lessons.count, c.lessons.length)
    }
  }
})

test('only SAT Basic lacks a Course Details strip', () => {
  assert.deepEqual(
    COURSES.filter((c) => c.details === null).map((c) => c.slug),
    ['sat-math-basic'],
  )
})

test('notes point at real text, and no proposed correction has been applied', () => {
  for (const c of COURSES) {
    for (const l of c.lessons) {
      for (const n of l.notes ?? []) {
        const text = n.at === 'title' ? l.title : l.topics[n.at]
        assert.ok(text !== undefined, `${l.id}: note points at topic ${String(n.at)}, which does not exist`)
        if (n.kind === 'joined') {
          assert.equal(n.printed.split(' | ').join(' '), text, l.id)
          continue
        }
        // garbled, misprint, unclear and clarify keep the printed text until approved.
        assert.equal(text, n.printed, `${l.id}: lesson text differs from what is printed`)
        assert.ok(n.proposed && n.proposed !== n.printed, `${l.id}: a note needs a distinct proposal`)
        if (n.kind === 'clarify') assert.equal(n.at, 'title', l.id)
      }
    }
  }
})
