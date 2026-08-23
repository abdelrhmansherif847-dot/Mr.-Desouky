/** LEVEL 2 — THE EDUCATIONAL SYSTEM: Teaching → … → Feedback. */

export type SystemStage = {
  id: string
  index: string
  title: string
  purpose: string
  body: string
  detail: string[]
  /** Which brand colour carries this stage. */
  tone: 'sky' | 'deep' | 'growth' | 'olive'
}

export const SYSTEM_STAGES: SystemStage[] = [
  {
    id: 'teaching',
    index: '01',
    title: 'Teaching',
    purpose: 'Explain concepts clearly and simply.',
    body: 'Every topic starts from the idea behind it, not the shortcut. The rule is derived, the reason is explained, and only then is the fast method introduced — so the student knows when it applies and when it does not.',
    detail: [
      'Concept first, shortcut second',
      'Worked examples built up step by step',
      'Common mistakes named before they happen',
    ],
    tone: 'sky',
  },
  {
    id: 'session',
    index: '02',
    title: 'Session',
    purpose: 'Students learn, practise, and apply.',
    body: 'The session is not a lecture. New material is taught, then applied immediately on graded-difficulty questions while help is still one hand-raise away.',
    detail: [
      'Teach → guided practice → independent attempt',
      'Questions ordered from foundation to exam level',
      'Every student attempts, not just watches',
    ],
    tone: 'sky',
  },
  {
    id: 'homework',
    index: '03',
    title: 'Homework',
    purpose: 'Students independently apply what they learned.',
    body: 'Homework is the first honest test of understanding, because nobody is there to help. It is targeted at exactly what the session covered and it is checked — not collected.',
    detail: [
      'Targeted to the session, never busywork',
      'Corrected with written notes, not a tick',
      'Completion is tracked and visible to parents',
    ],
    tone: 'olive',
  },
  {
    id: 'quiz',
    index: '04',
    title: 'Quiz',
    purpose: 'Measure understanding.',
    body: 'Short, frequent, timed. A quiz exists to produce data: which topics are solid, which are shaky, and which need to be re-taught before the course moves on.',
    detail: [
      'Timed, like the real section',
      'Scored per topic, not just overall',
      'Results feed straight into the review',
    ],
    tone: 'deep',
  },
  {
    id: 'review',
    index: '05',
    title: 'Review',
    purpose: 'Identify and correct gaps.',
    body: 'Every wrong answer is traced to its cause: a missing concept, a misread question, a calculation slip, or time pressure. Different causes need different fixes — and they get them.',
    detail: [
      'Every error classified by cause',
      'Concept gaps re-taught, not repeated',
      'A short targeted practice set follows',
    ],
    tone: 'growth',
  },
  {
    id: 'mock',
    index: '06',
    title: 'Mock',
    purpose: 'Simulate real exam performance.',
    body: 'Full length, full timing, real conditions. Mocks train pacing and pressure — the two things that quietly cost points from students who genuinely know the material.',
    detail: [
      'Real timing and real question order',
      'Pacing and section strategy trained',
      'Score trend tracked across attempts',
    ],
    tone: 'deep',
  },
  {
    id: 'feedback',
    index: '07',
    title: 'Feedback',
    purpose: 'Understand what happened and what comes next.',
    body: 'The stage that connects everything else. Feedback is not a comment on a paper — it is a short, direct answer to four questions, given to the student and visible to the parent.',
    detail: [
      'What happened?',
      'Why did it happen?',
      'What should improve?',
      'What should happen next?',
    ],
    tone: 'growth',
  },
]

export const FEEDBACK_QUESTIONS = [
  { q: 'What happened?', a: 'The facts, without softening them — the score, the topics, the timing.' },
  { q: 'Why did it happen?', a: 'The cause behind the result: a concept gap, a habit, pacing, or preparation.' },
  { q: 'What should improve?', a: 'One or two specific things — not a list of ten the student will ignore.' },
  { q: 'What should happen next?', a: 'The exact next action, with a deadline. Feedback without a next step changes nothing.' },
] as const
