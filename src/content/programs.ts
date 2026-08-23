/**
 * PROGRAMS — SAT and EST are kept completely separate by design.
 * Each exam has its own structure, its own syllabus and its own page.
 *
 * ⚠️  TODO: before launch, confirm every `duration`, `sessions`, `sessionLength`,
 *     `groupSize` and syllabus detail with Eng. Abdelrhman Desouky.
 *     These are structural placeholders, not published facts.
 */

export type ProgramLevel = 'Basic' | 'Advanced'
export type ExamTrack = 'SAT' | 'EST'

export type Program = {
  slug: string
  exam: ExamTrack
  level: ProgramLevel
  title: string
  shortTitle: string
  tagline: string
  summary: string
  forWho: string[]
  entryRequirement: string
  duration: string
  sessions: string
  sessionLength: string
  groupSize: string
  /** Topic areas taught, grouped. */
  learn: { area: string; topics: string[] }[]
  /** The full system as it applies to this program. */
  included: { label: string; detail: string }[]
  outcome: string[]
  nextStep: { label: string; href: string } | null
  order: number
}

export const PROGRAMS: Program[] = [
  /* ------------------------------- SAT MATH ------------------------------ */
  {
    slug: 'sat-math-basic',
    exam: 'SAT',
    level: 'Basic',
    title: 'SAT Math — Basic',
    shortTitle: 'SAT Basic',
    tagline: 'Build the foundation the whole section rests on.',
    summary:
      'A complete rebuild of the core Math the SAT actually tests. Every topic starts from the concept, is practised until it is automatic, and is measured before the course moves on. This is the track for a student who needs the fundamentals to be solid before speed and strategy mean anything.',
    forWho: [
      'Students starting SAT Math preparation for the first time',
      'Students whose diagnostic shows gaps in algebra or core skills',
      'Students who understand in class but lose marks under time',
      'Students returning to Math after a long gap',
    ],
    entryRequirement: 'Open to any student after the diagnostic assessment.',
    duration: '12 weeks',
    sessions: '24 sessions',
    sessionLength: '2 hours per session',
    groupSize: 'Small groups, plus a one-to-one option',
    learn: [
      {
        area: 'Algebra',
        topics: [
          'Linear equations in one and two variables',
          'Linear functions and their graphs',
          'Systems of linear equations',
          'Linear inequalities and their solution sets',
        ],
      },
      {
        area: 'Advanced Math — foundations',
        topics: [
          'Equivalent expressions and factoring',
          'Quadratic equations and their graphs',
          'Introduction to nonlinear functions',
          'Exponents and radicals',
        ],
      },
      {
        area: 'Problem-Solving & Data Analysis',
        topics: [
          'Ratios, rates, proportions and units',
          'Percentages and percentage change',
          'Reading tables, graphs and scatterplots',
          'Mean, median, mode and spread',
        ],
      },
      {
        area: 'Geometry & Trigonometry',
        topics: [
          'Angles, triangles and similarity',
          'Area, perimeter, surface area and volume',
          'Circles, arcs and sectors',
          'Right-triangle trigonometry and the Pythagorean theorem',
        ],
      },
      {
        area: 'Test skills',
        topics: [
          'Reading SAT question wording accurately',
          'Using the built-in calculator well',
          'Entering student-produced responses correctly',
          'Applying the Desouky Method to every question',
        ],
      },
    ],
    included: [
      { label: 'Teaching', detail: 'Concept-first explanation of every topic in the syllabus.' },
      { label: 'Sessions', detail: 'Teach, guided practice, then independent attempt — every session.' },
      { label: 'Homework', detail: 'Targeted set after every session, corrected with written notes.' },
      { label: 'Quizzes', detail: 'Short timed quiz per topic block, scored by topic.' },
      { label: 'Reviews', detail: 'Every error traced to its cause and re-taught where needed.' },
      { label: 'Mock exams', detail: 'Two full-length digital-format mocks with full review.' },
      { label: 'Feedback', detail: 'Written feedback after each quiz and mock, visible to parents.' },
      { label: 'Materials', detail: 'Workbook, practice sheets and topic summaries.' },
    ],
    outcome: [
      'Core SAT Math topics answered confidently and independently',
      'A consistent five-step routine on every question',
      'A clear, evidence-based picture of remaining weak areas',
      'Readiness to move into SAT Math — Advanced',
    ],
    nextStep: { label: 'SAT Math — Advanced', href: '/programs/sat-math-advanced' },
    order: 1,
  },
  {
    slug: 'sat-math-advanced',
    exam: 'SAT',
    level: 'Advanced',
    title: 'SAT Math — Advanced',
    shortTitle: 'SAT Advanced',
    tagline: 'Raise the ceiling on a foundation that already holds.',
    summary:
      'For students whose fundamentals are secure and whose remaining points are sitting in the hardest third of the section. The focus moves to multi-step problems, unfamiliar wording, trap answers, pacing and the strategy decisions that separate a good score from a top one.',
    forWho: [
      'Students who have completed SAT Math — Basic',
      'Students whose diagnostic shows a solid foundation',
      'Students already scoring well who are stuck below their target',
      'Students who run out of time before the last questions',
    ],
    entryRequirement:
      'Diagnostic assessment, or completion of SAT Math — Basic. The move up is based on results, not preference.',
    duration: '10 weeks',
    sessions: '20 sessions',
    sessionLength: '2 hours per session',
    groupSize: 'Small groups, plus a one-to-one option',
    learn: [
      {
        area: 'Advanced Math',
        topics: [
          'Nonlinear equations and systems',
          'Quadratic and polynomial functions in depth',
          'Exponential growth and decay',
          'Function transformations and interpretation',
          'Rational expressions and radical equations',
        ],
      },
      {
        area: 'Hard-question technique',
        topics: [
          'Multi-step and multi-topic problems',
          'Abstract and symbolic questions',
          'Recognising and avoiding trap answers',
          'Back-solving, substitution and estimation',
          'Choosing the fastest valid route under time',
        ],
      },
      {
        area: 'Data & modelling',
        topics: [
          'Interpreting models and their parameters',
          'Line of best fit and predictions',
          'Probability and conditional reasoning from tables',
          'Sample statistics and margin of error',
        ],
      },
      {
        area: 'Geometry & Trigonometry — advanced',
        topics: [
          'Circle equations in the coordinate plane',
          'Complex multi-shape figures',
          'Trigonometric relationships and radians',
        ],
      },
      {
        area: 'Exam strategy',
        topics: [
          'Module pacing and time allocation',
          'Handling the adaptive second module',
          'Decision-making: solve, skip, or return',
          'Managing pressure in the final minutes',
        ],
      },
    ],
    included: [
      { label: 'Teaching', detail: 'Advanced concepts explained, then pushed to exam difficulty.' },
      { label: 'Sessions', detail: 'Harder problem sets with strategy discussion built in.' },
      { label: 'Homework', detail: 'Advanced sets after every session, corrected individually.' },
      { label: 'Quizzes', detail: 'Timed quizzes at full exam difficulty, scored by topic.' },
      { label: 'Reviews', detail: 'Deep review of every error, including timing and strategy errors.' },
      { label: 'Mock exams', detail: 'Four full-length digital-format mocks with tracked score trend.' },
      { label: 'Feedback', detail: 'Written feedback after each quiz and mock, visible to parents.' },
      { label: 'Materials', detail: 'Advanced workbook, hard-question sets and strategy guides.' },
    ],
    outcome: [
      'The hardest questions attempted rather than skipped',
      'Reliable pacing across both modules',
      'Stable mock performance instead of results that swing',
      'A calm, rehearsed exam-day routine',
    ],
    nextStep: null,
    order: 2,
  },

  /* ------------------------------- EST MATH ------------------------------ */
  {
    slug: 'est-math-basic',
    exam: 'EST',
    level: 'Basic',
    title: 'EST Math — Basic',
    shortTitle: 'EST Basic',
    tagline: 'A foundation built specifically for the EST Math section.',
    summary:
      'A complete foundation course built around the EST Math section and its own question style. The EST is not the SAT, and it is not taught here as if it were: the syllabus, the wording, the pacing and the practice material are all EST-specific.',
    forWho: [
      'Students preparing for EST I Math for the first time',
      'Students whose diagnostic shows foundational gaps',
      'Students in Egyptian schools moving toward EST-accepting universities',
      'Students who need structure rather than extra hours',
    ],
    entryRequirement: 'Open to any student after the diagnostic assessment.',
    duration: '12 weeks',
    sessions: '24 sessions',
    sessionLength: '2 hours per session',
    groupSize: 'Small groups, plus a one-to-one option',
    learn: [
      {
        area: 'Numbers & operations',
        topics: [
          'Number properties, factors and multiples',
          'Ratios, rates and proportion',
          'Percentages and percentage change',
          'Exponents, roots and scientific notation',
        ],
      },
      {
        area: 'Algebra',
        topics: [
          'Linear equations and inequalities',
          'Systems of equations',
          'Algebraic expressions and factoring',
          'Introduction to quadratics',
        ],
      },
      {
        area: 'Functions & graphs',
        topics: [
          'Function notation and evaluation',
          'Linear functions, slope and intercepts',
          'Reading and interpreting graphs',
          'Coordinate geometry basics',
        ],
      },
      {
        area: 'Geometry & measurement',
        topics: [
          'Lines, angles and triangles',
          'Polygons, area and perimeter',
          'Circles, solids and volume',
          'Right-triangle trigonometry',
        ],
      },
      {
        area: 'Statistics & probability',
        topics: [
          'Averages and measures of spread',
          'Tables, charts and data interpretation',
          'Basic probability and counting',
        ],
      },
    ],
    included: [
      { label: 'Teaching', detail: 'Concept-first explanation of the full EST Math foundation.' },
      { label: 'Sessions', detail: 'Teach, guided practice, then independent attempt — every session.' },
      { label: 'Homework', detail: 'EST-style set after every session, corrected with written notes.' },
      { label: 'Quizzes', detail: 'Short timed quiz per topic block, scored by topic.' },
      { label: 'Reviews', detail: 'Every error traced to its cause and re-taught where needed.' },
      { label: 'Mock exams', detail: 'Two full-length EST-format Math mocks with full review.' },
      { label: 'Feedback', detail: 'Written feedback after each quiz and mock, visible to parents.' },
      { label: 'Materials', detail: 'EST workbook, practice sheets and topic summaries.' },
    ],
    outcome: [
      'The EST Math foundation covered and secured',
      'Familiarity with EST question style and wording',
      'A consistent five-step routine on every question',
      'Readiness to move into EST Math — Advanced',
    ],
    nextStep: { label: 'EST Math — Advanced', href: '/programs/est-math-advanced' },
    order: 3,
  },
  {
    slug: 'est-math-advanced',
    exam: 'EST',
    level: 'Advanced',
    title: 'EST Math — Advanced',
    shortTitle: 'EST Advanced',
    tagline: 'Higher-level EST Math, timing and strategy.',
    summary:
      'For students whose EST foundation is already secure. Difficulty rises to the top of the section, timing is trained deliberately, and full-length mocks turn a good score into a stable one. Suitable for students targeting a high EST I Math score or preparing further in Math.',
    forWho: [
      'Students who have completed EST Math — Basic',
      'Students whose diagnostic shows a solid foundation',
      'Students targeting a high EST Math score',
      'Students who lose marks to time rather than to knowledge',
    ],
    entryRequirement:
      'Diagnostic assessment, or completion of EST Math — Basic. The move up is based on results, not preference.',
    duration: '10 weeks',
    sessions: '20 sessions',
    sessionLength: '2 hours per session',
    groupSize: 'Small groups, plus a one-to-one option',
    learn: [
      {
        area: 'Advanced algebra',
        topics: [
          'Quadratic and polynomial equations in depth',
          'Rational and radical expressions',
          'Exponential and logarithmic ideas',
          'Sequences and series',
        ],
      },
      {
        area: 'Advanced functions',
        topics: [
          'Function transformations and composition',
          'Nonlinear systems',
          'Modelling with functions',
          'Domain, range and interpretation',
        ],
      },
      {
        area: 'Advanced geometry & trigonometry',
        topics: [
          'Coordinate geometry and circle equations',
          'Complex multi-shape figures',
          'Trigonometric relationships and identities',
          'Three-dimensional reasoning',
        ],
      },
      {
        area: 'Hard-question technique',
        topics: [
          'Multi-step and multi-topic problems',
          'Unfamiliar wording and abstract questions',
          'Elimination, substitution and estimation',
          'Choosing the fastest valid route under time',
        ],
      },
      {
        area: 'Exam strategy',
        topics: [
          'Section pacing and time allocation',
          'Decision-making: solve, skip, or return',
          'Managing pressure in the final minutes',
          'Exam-day routine and preparation',
        ],
      },
    ],
    included: [
      { label: 'Teaching', detail: 'Advanced concepts explained, then pushed to exam difficulty.' },
      { label: 'Sessions', detail: 'Harder EST problem sets with strategy discussion built in.' },
      { label: 'Homework', detail: 'Advanced sets after every session, corrected individually.' },
      { label: 'Quizzes', detail: 'Timed quizzes at full exam difficulty, scored by topic.' },
      { label: 'Reviews', detail: 'Deep review of every error, including timing and strategy errors.' },
      { label: 'Mock exams', detail: 'Four full-length EST-format Math mocks with tracked score trend.' },
      { label: 'Feedback', detail: 'Written feedback after each quiz and mock, visible to parents.' },
      { label: 'Materials', detail: 'Advanced EST workbook, hard-question sets and strategy guides.' },
    ],
    outcome: [
      'The hardest EST Math questions attempted rather than skipped',
      'Reliable pacing across the full section',
      'Stable mock performance instead of results that swing',
      'A calm, rehearsed exam-day routine',
    ],
    nextStep: null,
    order: 4,
  },
]

export const TRACKS: Record<ExamTrack, { name: string; full: string; blurb: string }> = {
  SAT: {
    name: 'SAT Math',
    full: 'SAT Math',
    blurb:
      'For students applying to universities that accept the SAT. Two levels, taught around the digital SAT’s adaptive format, its four content domains and its question style.',
  },
  EST: {
    name: 'EST Math',
    full: 'EST Math',
    blurb:
      'For students taking the EST for admission in Egypt and the region. Two levels, taught around the EST Math section’s own syllabus, wording and timing — never adapted from SAT material.',
  },
}

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug)
}

export function programsByTrack(track: ExamTrack): Program[] {
  return PROGRAMS.filter((p) => p.exam === track).sort((a, b) => a.order - b.order)
}
