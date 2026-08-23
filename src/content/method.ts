/** THE DESOUKY METHOD — the signature five-step approach to any question. */

export type MethodStep = {
  id: string
  index: string
  title: string
  tagline: string
  body: string
  inPractice: string[]
  mistake: string
  symbol: string
}

export const METHOD_STEPS: MethodStep[] = [
  {
    id: 'read',
    index: '01',
    title: 'Read',
    tagline: 'Understand the question.',
    body: 'Read the whole question before touching the pen. Most lost marks in SAT and EST Math are not caused by weak Math — they are caused by answering a question that was never asked.',
    inPractice: [
      'Read once for meaning, once for detail',
      'Underline exactly what is being asked for',
      'Notice units, restrictions and the words "not", "least", "must"',
    ],
    mistake: 'Starting to calculate halfway through the first read.',
    symbol: '?',
  },
  {
    id: 'analyze',
    index: '02',
    title: 'Analyze',
    tagline: 'Identify what is given and what is required.',
    body: 'Separate the question into two columns in your head: what you have, and what you need. The distance between them is the problem — and naming it usually reveals the route.',
    inPractice: [
      'List the given values and conditions',
      'State the required quantity in one phrase',
      'Sketch, label, or rewrite the relation when it helps',
    ],
    mistake: 'Treating an unfamiliar wording as an unfamiliar topic.',
    symbol: 'Σ',
  },
  {
    id: 'plan',
    index: '03',
    title: 'Plan',
    tagline: 'Choose the correct approach.',
    body: 'There is usually more than one valid route, and they are not equally fast. Choosing deliberately — algebra, substitution, the answer choices, or the calculator — is where time is won.',
    inPractice: [
      'Pick the shortest valid route, not the first one',
      'Decide before solving: by hand, by substitution, or by calculator',
      'Estimate roughly what the answer should look like',
    ],
    mistake: 'Defaulting to heavy algebra when back-solving takes ten seconds.',
    symbol: 'π',
  },
  {
    id: 'solve',
    index: '04',
    title: 'Solve',
    tagline: 'Execute the solution step by step.',
    body: 'Work in clean, visible steps. Neat work is not about presentation — it is what makes an error findable in the twenty seconds you have to find it.',
    inPractice: [
      'One idea per line, nothing skipped mentally',
      'Keep the work aligned and readable',
      'Stop the moment you reach what was actually asked',
    ],
    mistake: 'Doing three steps in your head to save five seconds, then losing the mark.',
    symbol: '√',
  },
  {
    id: 'check',
    index: '05',
    title: 'Check',
    tagline: 'Verify the answer.',
    body: 'The final step, and the first one students drop under pressure. A ten-second check catches the sign error, the wrong unit, and the answer to the question that was not asked.',
    inPractice: [
      'Does it answer the exact question?',
      'Is it reasonable in size, sign and unit?',
      'Substitute back when the check is quick',
    ],
    mistake: 'Trusting a clean-looking answer without re-reading the question.',
    symbol: 'x²',
  },
]

export const METHOD_SUMMARY = {
  lead: 'Five steps. Every question. Every time.',
  body: 'The Desouky Method is not a trick for hard questions — it is the routine used on every question, easy or hard, until it becomes automatic. Under exam pressure, students do not rise to the occasion; they fall back on their habits. This is the habit worth building.',
  why: [
    {
      title: 'It removes panic',
      body: 'When a question looks unfamiliar, the student still knows exactly what to do first. There is always a next step.',
    },
    {
      title: 'It makes errors findable',
      body: 'A structured solution can be checked. A scattered one can only be redone — and there is no time to redo.',
    },
    {
      title: 'It transfers',
      body: 'The same five steps work in SAT, in EST, in school Math, and in university. It is a way of thinking, not a syllabus.',
    },
  ],
} as const
