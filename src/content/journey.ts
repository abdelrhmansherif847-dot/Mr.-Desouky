/** LEVEL 3 — STUDENT SUCCESS: the seven-stage journey. */

export type JourneyStage = {
  id: string
  index: string
  title: string
  tagline: string
  body: string
  studentSees: string
  outcome: string
  /** Roughly where in the program this sits, as a percentage. */
  position: number
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'assessment',
    index: '01',
    title: 'Assessment',
    tagline: "Know the student's starting point.",
    body: 'Before anything is taught, a diagnostic establishes what the student already holds securely and what is missing. It decides the level, the pace, and the first topics — and it becomes the baseline every later result is measured against.',
    studentSees: 'A diagnostic result broken down by topic, plus the recommended program and level.',
    outcome: 'A clear, honest starting point instead of a guess.',
    position: 0,
  },
  {
    id: 'foundation',
    index: '02',
    title: 'Foundation',
    tagline: 'Build strong fundamentals.',
    body: 'The gaps found in the assessment are closed first. Algebra, ratios, functions and the core skills every harder question quietly depends on are rebuilt until they are automatic, because advanced training on a weak foundation only produces faster mistakes.',
    studentSees: 'Foundation sessions, targeted homework, and short topic quizzes.',
    outcome: 'Core topics move from "I sort of remember" to "I can do this".',
    position: 16,
  },
  {
    id: 'practice',
    index: '03',
    title: 'Practice',
    tagline: 'Consistent practice.',
    body: 'Regular, structured, independent work. Practice sets are graded in difficulty and tied directly to what was taught, so effort turns into ability rather than into hours.',
    studentSees: 'Weekly homework, practice sheets and a visible completion record.',
    outcome: 'Speed and accuracy rise together, not one at the cost of the other.',
    position: 33,
  },
  {
    id: 'analysis',
    index: '04',
    title: 'Analysis',
    tagline: 'Identify strengths and weaknesses.',
    body: 'Quiz and homework data is read topic by topic. Strengths are confirmed so time is not wasted on them; weaknesses are named specifically — not "geometry" but "circle theorems under time".',
    studentSees: 'A strengths and weaknesses breakdown that updates as results come in.',
    outcome: 'Study time is spent where it actually changes the score.',
    position: 50,
  },
  {
    id: 'advanced',
    index: '05',
    title: 'Advanced Training',
    tagline: 'Higher-level questions and strategies.',
    body: 'Once the foundation holds, difficulty rises deliberately: multi-step problems, unfamiliar wording, trap answers, and the strategy decisions that separate a good score from a top one.',
    studentSees: 'Advanced problem sets, strategy sessions and harder timed drills.',
    outcome: 'The hardest third of the section stops being the part that is skipped.',
    position: 66,
  },
  {
    id: 'mock',
    index: '06',
    title: 'Mock Exams',
    tagline: 'Real exam simulation.',
    body: 'Full-length exams under real timing and real conditions, repeated so the score becomes stable rather than lucky. Each mock is followed by a full review, because the value is in the analysis, not the number.',
    studentSees: 'Mock scores over time, section timing, and a per-mock review.',
    outcome: 'Exam conditions become familiar and pacing becomes reliable.',
    position: 83,
  },
  {
    id: 'final',
    index: '07',
    title: 'Final Preparation',
    tagline: 'Be confident. Be ready.',
    body: 'The last phase is deliberately calm: consolidate what is strong, close whatever remains open, rehearse exam-day routine, and stop adding new material. The goal is a student who arrives rested, prepared and unsurprised.',
    studentSees: 'A final checklist, a light review plan, and exam-day guidance.',
    outcome: 'A student who walks in knowing exactly what to expect.',
    position: 100,
  },
]

/** MENTORING & ADVISING — the human layer around the system. */

export const MENTORING = {
  title: 'Mentoring',
  lead: 'Following the student, not just the syllabus.',
  body: 'A study plan only works if someone is watching whether it is actually working. Mentoring is the ongoing part: noticing when attendance slips, when homework quality drops, when a confident student quietly stops asking questions, and stepping in early — while it is still a small correction.',
  points: [
    { title: 'Progress is watched, not assumed', body: 'Attendance, homework and quiz trends are reviewed continuously, not at the end of the term.' },
    { title: 'Early intervention', body: 'A dip is addressed the week it appears, not the month before the exam.' },
    { title: 'Motivation is part of the job', body: 'Plateaus are normal and are handled directly, so a discouraged student does not become a disengaged one.' },
    { title: 'The student stays informed', body: 'Students always know where they stand. Nobody is left guessing about their own progress.' },
  ],
} as const

export const ADVISING = {
  title: 'Advising',
  lead: 'Helping students and parents make the right decisions.',
  body: 'Most families arrive with the same questions: which exam, which level, how long, and what happens after. Advising answers those honestly — including when the honest answer is that a student is not ready to move up yet, or does not need the more expensive track.',
  points: [
    { title: 'Choosing the right program', body: 'SAT or EST — matched to the student’s target universities and timeline.' },
    { title: 'Choosing the right level', body: 'Basic or Advanced, decided by the diagnostic rather than by preference.' },
    { title: 'Moving from Basic to Advanced', body: 'A move happens when the results support it, based on quiz and mock evidence.' },
    { title: 'Preparing for the exam', body: 'Test-date planning, realistic targets, and how many attempts make sense.' },
    { title: 'Understanding the student’s needs', body: 'Pace, workload and schedule adjusted to the student in front of us.' },
  ],
} as const

/** PARENT VISIBILITY — what a parent can see and why. */
export const PARENT_PROMISE = {
  lead: 'Parents should not have to ask to know how their child is doing.',
  body: 'Everything the system measures is visible: attendance, homework completion, quiz performance, mock scores, and the strengths and weaknesses behind them. No exaggerated promises, no vague reassurance — just the same evidence the teacher uses.',
  items: [
    { title: 'Attendance', body: 'Every session, recorded.' },
    { title: 'Homework completion', body: 'What was set, what was submitted, and on time or not.' },
    { title: 'Quiz performance', body: 'Scores by topic, so a dip is traceable to a cause.' },
    { title: 'Mock scores', body: 'The full trend across attempts, not a single best result.' },
    { title: 'Strengths & weaknesses', body: 'What is secure, and what is currently being worked on.' },
    { title: 'Upcoming sessions', body: 'Dates, topics, and what to prepare.' },
    { title: 'Reports', body: 'A written summary at the end of each phase.' },
  ],
} as const
