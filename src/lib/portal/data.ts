import type { ParentRecord, StudentRecord } from './types'

/**
 * PORTAL DATA SEAM
 * ================
 * The portals are built against these two functions and nothing else.
 *
 * Today they return SAMPLE data so the interface can be reviewed and
 * signed off. To make the portals live, replace the bodies with real
 * calls — a database query, an API request, whatever the backend becomes —
 * and keep the return types. No portal component needs to change.
 *
 *   export async function getStudentRecord(id: string) {
 *     const row = await db.student.findUnique({ where: { id }, include: {...} })
 *     return toStudentRecord(row)
 *   }
 *
 * Authentication is a separate concern and is NOT implemented here — see
 * src/lib/portal/auth.ts for where it plugs in.
 */

export const IS_SAMPLE_DATA = true

const SAMPLE_STUDENT: StudentRecord = {
  profile: {
    id: 'sample-student',
    name: 'Youssef K.',
    programSlug: 'sat-math-basic',
    programTitle: 'SAT Math — Basic',
    exam: 'SAT',
    level: 'Basic',
    startedOn: '2025-09-15',
    currentStageIndex: 3, // Analysis
    targetExamDate: '2026-03-14',
  },

  sessions: [
    { id: 's-12', date: '2026-01-20', time: '17:00', topic: 'Systems of linear equations', stage: 'Foundation', status: 'attended' },
    { id: 's-13', date: '2026-01-24', time: '17:00', topic: 'Linear inequalities', stage: 'Foundation', status: 'attended' },
    { id: 's-14', date: '2026-01-27', time: '17:00', topic: 'Ratios, rates and units', stage: 'Practice', status: 'attended' },
    { id: 's-15', date: '2026-01-31', time: '17:00', topic: 'Percentages and percentage change', stage: 'Practice', status: 'missed' },
    { id: 's-16', date: '2026-02-03', time: '17:00', topic: 'Data interpretation — tables and graphs', stage: 'Practice', status: 'attended' },
    { id: 's-17', date: '2026-02-07', time: '17:00', topic: 'Quadratics — factoring', stage: 'Analysis', status: 'upcoming', prepare: 'Review the factoring summary sheet before the session.' },
    { id: 's-18', date: '2026-02-10', time: '17:00', topic: 'Quadratics — graphs and roots', stage: 'Analysis', status: 'upcoming' },
    { id: 's-19', date: '2026-02-14', time: '17:00', topic: 'Circles, arcs and sectors', stage: 'Analysis', status: 'upcoming' },
  ],

  homework: [
    { id: 'h-08', title: 'Linear systems — practice set B', topic: 'Algebra', setOn: '2026-01-20', dueOn: '2026-01-23', status: 'completed', score: 88, note: 'Clean work. Watch the sign when eliminating.' },
    { id: 'h-09', title: 'Inequalities — practice set A', topic: 'Algebra', setOn: '2026-01-24', dueOn: '2026-01-27', status: 'completed', score: 92 },
    { id: 'h-10', title: 'Ratios and units — mixed set', topic: 'Problem-Solving & Data', setOn: '2026-01-27', dueOn: '2026-01-30', status: 'late', score: 74, note: 'Submitted two days late. Q7 and Q11 were unit-conversion errors, not method errors.' },
    { id: 'h-11', title: 'Percentage change — word problems', topic: 'Problem-Solving & Data', setOn: '2026-01-31', dueOn: '2026-02-03', status: 'missed', note: 'Not submitted. Covered in the catch-up plan.' },
    { id: 'h-12', title: 'Graph reading — practice set A', topic: 'Problem-Solving & Data', setOn: '2026-02-03', dueOn: '2026-02-06', status: 'completed', score: 81 },
    { id: 'h-13', title: 'Factoring — foundation set', topic: 'Advanced Math', setOn: '2026-02-07', dueOn: '2026-02-10', status: 'pending' },
  ],

  quizzes: [
    {
      id: 'q-04',
      title: 'Quiz 4 — Linear equations & systems',
      date: '2026-01-24',
      score: 17,
      total: 20,
      topics: [
        { name: 'Linear equations', correct: 7, total: 7 },
        { name: 'Systems', correct: 6, total: 7 },
        { name: 'Inequalities', correct: 4, total: 6 },
      ],
    },
    {
      id: 'q-05',
      title: 'Quiz 5 — Ratios, rates & percentages',
      date: '2026-02-03',
      score: 13,
      total: 20,
      topics: [
        { name: 'Ratios and rates', correct: 6, total: 7 },
        { name: 'Percentages', correct: 3, total: 7 },
        { name: 'Units and conversion', correct: 4, total: 6 },
      ],
    },
  ],

  reviews: [
    {
      id: 'r-04',
      quizId: 'q-04',
      date: '2026-01-27',
      summary:
        'Strong on equations and systems. The three lost marks were all in inequalities, and all three were the same error — flipping the sign when multiplying by a negative.',
      causes: [
        { label: 'Concept gap', count: 2 },
        { label: 'Careless slip', count: 1 },
      ],
      next: 'Complete the inequalities correction set before the next session.',
    },
    {
      id: 'r-05',
      quizId: 'q-05',
      date: '2026-02-06',
      summary:
        'Percentages are the clear weakness — four marks lost, and three of them were percentage-change questions where the base was taken from the wrong value. Ratios are secure.',
      causes: [
        { label: 'Concept gap', count: 3 },
        { label: 'Misread question', count: 2 },
        { label: 'Time pressure', count: 2 },
      ],
      next: 'Percentage change is re-taught in the next session, then a targeted set follows.',
    },
  ],

  mocks: [
    {
      id: 'm-01',
      label: 'Mock 1',
      date: '2025-12-06',
      score: 540,
      total: 800,
      modules: [
        { name: 'Module 1', correct: 15, total: 22, minutesUsed: 35, minutesAllowed: 35 },
        { name: 'Module 2', correct: 12, total: 22, minutesUsed: 35, minutesAllowed: 35 },
      ],
      note: 'Ran out of time in both modules. Six questions left unattempted.',
    },
    {
      id: 'm-02',
      label: 'Mock 2',
      date: '2026-01-17',
      score: 590,
      total: 800,
      modules: [
        { name: 'Module 1', correct: 17, total: 22, minutesUsed: 33, minutesAllowed: 35 },
        { name: 'Module 2', correct: 14, total: 22, minutesUsed: 35, minutesAllowed: 35 },
      ],
      note: 'Pacing improved in Module 1. All questions attempted for the first time.',
    },
  ],

  topics: [
    { name: 'Linear equations', score: 94, attempts: 42, status: 'strong' },
    { name: 'Systems of equations', score: 88, attempts: 31, status: 'strong' },
    { name: 'Ratios and rates', score: 85, attempts: 28, status: 'strong' },
    { name: 'Graph and table reading', score: 79, attempts: 24, status: 'developing' },
    { name: 'Inequalities', score: 68, attempts: 22, status: 'developing' },
    { name: 'Geometry — angles and triangles', score: 72, attempts: 19, status: 'developing' },
    { name: 'Percentages and percentage change', score: 48, attempts: 26, status: 'weak' },
    { name: 'Units and conversion', score: 61, attempts: 18, status: 'weak' },
  ],

  achievements: [
    { id: 'a-01', title: 'Foundation complete', description: 'All Foundation-stage topics passed at 70% or above.', earnedOn: '2025-12-20' },
    { id: 'a-02', title: 'Six weeks unbroken', description: 'Six consecutive weeks with every homework submitted.', earnedOn: '2026-01-10' },
    { id: 'a-03', title: 'Full attempt', description: 'First mock exam with every question attempted.', earnedOn: '2026-01-17' },
  ],

  feedback: [
    {
      id: 'f-02',
      date: '2026-02-06',
      source: 'Quiz 5 — Ratios, rates & percentages',
      what: '13 out of 20. Ratios were near perfect; percentages lost four marks.',
      why: 'Percentage change is being calculated from the new value instead of the original. It is one misunderstanding repeating, not seven separate mistakes.',
      improve: 'Identify the base value before calculating — write it down before touching the numbers.',
      next: 'Percentage change is re-taught on 7 February, followed by a targeted set due 10 February.',
    },
    {
      id: 'f-01',
      date: '2026-01-27',
      source: 'Quiz 4 — Linear equations & systems',
      what: '17 out of 20. Equations and systems are secure.',
      why: 'All three lost marks came from not flipping the inequality sign when multiplying by a negative.',
      improve: 'Pause at every multiplication by a negative and check the sign deliberately.',
      next: 'Complete the inequalities correction set before the next session.',
    },
  ],
}

/**
 * A deliberately different second record: EST rather than SAT, further along
 * the journey, and with a clean attendance/homework record — so the parent
 * portal demonstrates both the "needs attention" and the "on track" state.
 */
const SAMPLE_SECOND_CHILD: StudentRecord = {
  profile: {
    id: 'sample-student-2',
    name: 'Hana K.',
    programSlug: 'est-math-advanced',
    programTitle: 'EST Math — Advanced',
    exam: 'EST',
    level: 'Advanced',
    startedOn: '2025-10-05',
    currentStageIndex: 5, // Mock Exams
    targetExamDate: '2026-04-11',
  },

  sessions: [
    { id: 'hs-18', date: '2026-01-21', time: '19:00', topic: 'Function transformations', stage: 'Advanced Training', status: 'attended' },
    { id: 'hs-19', date: '2026-01-25', time: '19:00', topic: 'Nonlinear systems', stage: 'Advanced Training', status: 'attended' },
    { id: 'hs-20', date: '2026-01-28', time: '19:00', topic: 'Sequences and series', stage: 'Advanced Training', status: 'attended' },
    { id: 'hs-21', date: '2026-02-01', time: '19:00', topic: 'Mock 3 — full section under timing', stage: 'Mock Exams', status: 'attended' },
    { id: 'hs-22', date: '2026-02-04', time: '19:00', topic: 'Mock 3 review — pacing and error causes', stage: 'Mock Exams', status: 'attended' },
    { id: 'hs-23', date: '2026-02-08', time: '19:00', topic: 'Coordinate geometry — circle equations', stage: 'Mock Exams', status: 'upcoming', prepare: 'Bring the Mock 3 paper with your corrections marked.' },
    { id: 'hs-24', date: '2026-02-11', time: '19:00', topic: 'Mock 4 — full section under timing', stage: 'Mock Exams', status: 'upcoming' },
  ],

  homework: [
    { id: 'hh-14', title: 'Function transformations — advanced set', topic: 'Advanced functions', setOn: '2026-01-21', dueOn: '2026-01-24', status: 'completed', score: 91 },
    { id: 'hh-15', title: 'Nonlinear systems — hard set', topic: 'Advanced algebra', setOn: '2026-01-25', dueOn: '2026-01-28', status: 'completed', score: 86, note: 'Strong method. Two slips came from skipping steps mentally.' },
    { id: 'hh-16', title: 'Sequences and series — mixed set', topic: 'Advanced algebra', setOn: '2026-01-28', dueOn: '2026-01-31', status: 'completed', score: 94 },
    { id: 'hh-17', title: 'Mock 3 correction set', topic: 'Mixed', setOn: '2026-02-04', dueOn: '2026-02-07', status: 'completed', score: 89 },
    { id: 'hh-18', title: 'Circle equations — practice set', topic: 'Advanced geometry', setOn: '2026-02-08', dueOn: '2026-02-11', status: 'pending' },
  ],

  quizzes: [
    {
      id: 'hq-08',
      title: 'Quiz 8 — Functions & transformations',
      date: '2026-01-25',
      score: 18,
      total: 20,
      topics: [
        { name: 'Function notation', correct: 6, total: 6 },
        { name: 'Transformations', correct: 7, total: 8 },
        { name: 'Composition', correct: 5, total: 6 },
      ],
    },
    {
      id: 'hq-09',
      title: 'Quiz 9 — Sequences, series & logarithms',
      date: '2026-02-01',
      score: 16,
      total: 20,
      topics: [
        { name: 'Arithmetic sequences', correct: 7, total: 7 },
        { name: 'Geometric sequences', correct: 6, total: 7 },
        { name: 'Logarithms', correct: 3, total: 6 },
      ],
    },
  ],

  reviews: [
    {
      id: 'hr-08',
      quizId: 'hq-08',
      date: '2026-01-28',
      summary:
        'Near-complete. The two lost marks were both on horizontal transformations, where the direction of the shift was inverted — a classic and correctable confusion.',
      causes: [{ label: 'Concept gap', count: 2 }],
      next: 'Short transformation drill before the next session.',
    },
    {
      id: 'hr-09',
      quizId: 'hq-09',
      date: '2026-02-04',
      summary:
        'Sequences are secure. Logarithms are the weak point — three marks lost, all on changing the base. Nothing here is a method problem; the log rules are simply not automatic yet.',
      causes: [
        { label: 'Concept gap', count: 3 },
        { label: 'Careless slip', count: 1 },
      ],
      next: 'Logarithm rules drilled daily for one week, then re-quizzed.',
    },
  ],

  mocks: [
    {
      id: 'hm-01',
      label: 'Mock 1',
      date: '2025-11-22',
      score: 610,
      total: 800,
      modules: [
        { name: 'Section 1', correct: 18, total: 25, minutesUsed: 40, minutesAllowed: 40 },
        { name: 'Section 2', correct: 16, total: 25, minutesUsed: 40, minutesAllowed: 40 },
      ],
      note: 'Accuracy good, pacing tight. Last four questions rushed in both sections.',
    },
    {
      id: 'hm-02',
      label: 'Mock 2',
      date: '2026-01-03',
      score: 680,
      total: 800,
      modules: [
        { name: 'Section 1', correct: 21, total: 25, minutesUsed: 37, minutesAllowed: 40 },
        { name: 'Section 2', correct: 19, total: 25, minutesUsed: 39, minutesAllowed: 40 },
      ],
      note: 'Pacing plan working. Time left over in Section 1 for the first time.',
    },
    {
      id: 'hm-03',
      label: 'Mock 3',
      date: '2026-02-01',
      score: 700,
      total: 800,
      modules: [
        { name: 'Section 1', correct: 22, total: 25, minutesUsed: 36, minutesAllowed: 40 },
        { name: 'Section 2', correct: 21, total: 25, minutesUsed: 38, minutesAllowed: 40 },
      ],
      note: 'Third mock in a row with an improvement. Remaining errors cluster in logarithms.',
    },
  ],

  topics: [
    { name: 'Function transformations', score: 93, attempts: 34, status: 'strong' },
    { name: 'Sequences and series', score: 91, attempts: 26, status: 'strong' },
    { name: 'Nonlinear systems', score: 87, attempts: 30, status: 'strong' },
    { name: 'Coordinate geometry', score: 82, attempts: 22, status: 'strong' },
    { name: 'Trigonometric identities', score: 74, attempts: 20, status: 'developing' },
    { name: 'Three-dimensional reasoning', score: 71, attempts: 15, status: 'developing' },
    { name: 'Logarithms', score: 55, attempts: 21, status: 'weak' },
  ],

  achievements: [
    { id: 'ha-01', title: 'Advanced entry', description: 'Diagnostic placed straight into the Advanced level.', earnedOn: '2025-10-05' },
    { id: 'ha-02', title: 'Full attendance', description: 'Every scheduled session attended this phase.', earnedOn: '2026-02-04' },
    { id: 'ha-03', title: 'Three mocks rising', description: 'Three consecutive mock exams with an improved score.', earnedOn: '2026-02-01' },
  ],

  feedback: [
    {
      id: 'hf-03',
      date: '2026-02-04',
      source: 'Mock 3 — full EST Math section',
      what: '700 out of 800, up 20 on Mock 2 and 90 on Mock 1. Timing comfortable in both sections.',
      why: 'Pacing is no longer the limiting factor. The remaining errors are concentrated in one topic rather than spread across the paper.',
      improve: 'Logarithms — specifically changing the base. This is the single topic standing between the current score and the target.',
      next: 'Daily logarithm drill for one week, re-quiz on 11 February, then Mock 4.',
    },
    {
      id: 'hf-02',
      date: '2026-02-04',
      source: 'Quiz 9 — Sequences, series & logarithms',
      what: '16 out of 20. Sequences perfect; logarithms lost three marks.',
      why: 'The log rules are understood but not yet automatic, so they cost time and accuracy under pressure.',
      improve: 'Drill the three log rules until they need no thinking.',
      next: 'Re-quiz on logarithms on 11 February.',
    },
  ],
}

/** Replace with a real lookup once a backend exists. */
export async function getStudentRecord(_id?: string): Promise<StudentRecord> {
  return SAMPLE_STUDENT
}

/** Replace with a real lookup once a backend exists. */
export async function getParentRecord(_id?: string): Promise<ParentRecord> {
  return {
    parentName: 'Mr. Kamal',
    children: [SAMPLE_STUDENT, SAMPLE_SECOND_CHILD],
  }
}

/* --------------------------- derived helpers ---------------------------- */

export function attendanceRate(record: StudentRecord): { attended: number; held: number; rate: number } {
  const held = record.sessions.filter((s) => s.status !== 'upcoming').length
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
  const total = record.quizzes.reduce((sum, q) => sum + q.score / q.total, 0)
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

export function upcomingSessions(record: StudentRecord) {
  return record.sessions.filter((s) => s.status === 'upcoming')
}

export function topicsByStatus(record: StudentRecord, status: 'strong' | 'developing' | 'weak') {
  return record.topics.filter((t) => t.status === status).sort((a, b) => b.score - a.score)
}
