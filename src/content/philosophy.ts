/** LEVEL 1 — PHILOSOPHY: vision, mission, values, principles, success. */

export const CORE_BELIEF = {
  statement:
    'Math is not difficult. It needs the right explanation, consistent practice, and a clear system.',
  expansion:
    'Almost no student is “bad at Math”. What usually happens is that one idea was missed, the gap was never found, and everything built on top of it felt impossible. Find the gap, explain it properly, practise it until it is automatic — and the difficulty disappears.',
} as const

export const LEARNING_LOOP = ['Understand', 'Practice', 'Improve', 'Perform'] as const

export const VISION = {
  title: 'Vision',
  body: 'A generation of students who walk into an SAT or EST Math section calm, prepared, and certain of what to do — because they were taught a system, not a set of tricks.',
} as const

export const MISSION = {
  title: 'Mission',
  body: 'To teach SAT and EST Math through a structured system that makes every concept clear, measures understanding honestly, exposes weaknesses early, and turns them into strengths through deliberate practice and real feedback.',
} as const

export type ValueItem = { title: string; body: string }

export const VALUES: ValueItem[] = [
  {
    title: 'Clarity before speed',
    body: 'A student who understands slowly today will answer quickly in three weeks. A student who memorises quickly today will freeze on exam day. Understanding always comes first.',
  },
  {
    title: 'Honesty about results',
    body: 'Scores are reported as they are. A weak quiz is information, not a verdict. Nothing useful comes from hiding a gap from the student or the parent.',
  },
  {
    title: 'Structure over improvisation',
    body: 'Every session has a purpose, every homework has a target, every quiz measures something specific. Nothing in the plan is there by accident.',
  },
  {
    title: 'Consistency over intensity',
    body: 'Steady weekly work beats a panic month before the exam. The system is built around habits a student can actually keep.',
  },
  {
    title: 'Respect for the student',
    body: 'Questions are never treated as silly. A student who feels safe asking is a student who improves. Calm rooms produce confident thinkers.',
  },
  {
    title: 'Evidence, not promises',
    body: 'Progress is shown through attendance, homework, quizzes, reviews and mock exams — not through claims. Parents see the same evidence the student sees.',
  },
]

export type Principle = { number: string; title: string; body: string }

export const PRINCIPLES: Principle[] = [
  {
    number: '01',
    title: 'Every student starts from a known point',
    body: 'No program begins before an assessment. Teaching without knowing the starting point is guessing.',
  },
  {
    number: '02',
    title: 'Concepts are explained, not dictated',
    body: 'A rule you cannot explain is a rule you will misapply under pressure. Every method is justified before it is drilled.',
  },
  {
    number: '03',
    title: 'Practice must be independent',
    body: 'Understanding a solution on the board is not the same as producing one alone. Homework exists to prove the difference.',
  },
  {
    number: '04',
    title: 'Weakness is found early, on purpose',
    body: 'Quizzes and reviews are designed to surface gaps while there is still time to fix them — not to decorate a report.',
  },
  {
    number: '05',
    title: 'The exam is simulated before it is taken',
    body: 'Timing, pressure, and question order are trained. Exam day should feel familiar, not new.',
  },
  {
    number: '06',
    title: 'Feedback answers four questions',
    body: 'What happened, why it happened, what should improve, and what happens next. Feedback without a next step is just a comment.',
  },
]

export const SUCCESS_DEFINITION = {
  title: 'What success actually means',
  lead: 'Success is not only a high score.',
  body: 'A high score is the natural outcome of something deeper: a student who understands the material, works consistently, knows their own weak points, and can perform under exam conditions. Those four things are what the system builds. When they are in place, the score follows — and the student keeps the skill long after the exam.',
  markers: [
    'The student can explain their own solution, not just reproduce it.',
    'The student knows which topics are weak — before the teacher tells them.',
    'Homework is completed independently and on time.',
    'Mock exam performance is stable, not lucky.',
    'The student walks into the exam calm and prepared.',
  ],
  disclaimer:
    'No honest teacher can guarantee a specific score. What is guaranteed here is a structured process, measured progress, and clear feedback at every stage.',
} as const
