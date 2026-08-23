/**
 * ABOUT — personal, not corporate.
 *
 * ⚠️  This copy deliberately contains NO unverified biographical claims:
 *     no years of experience, no student counts, no score statistics.
 *     Add those only once Eng. Abdelrhman Desouky has confirmed them —
 *     see `OPTIONAL_CREDENTIALS` at the bottom of this file.
 */

export const INTRO = {
  eyebrow: 'About',
  title: 'Who is Eng. Abdelrhman Desouky?',
  lead: 'A Math teacher who got tired of watching capable students believe they were bad at Math.',
  paragraphs: [
    'Most students who arrive here have been told, in one way or another, that Math is simply not their subject. Almost none of them are right about that. What actually happened is ordinary: an idea was missed somewhere, nobody found it, and every topic built on top of it felt heavier than it should have. By the time the SAT or EST arrives, the student is not struggling with the exam — they are struggling with a gap that has been quietly compounding for years.',
    'That observation is what this system was built around. Not a set of tricks for hard questions, and not more hours of the same teaching that did not work the first time. A structure: find the starting point honestly, rebuild the foundation, practise deliberately, measure what is actually understood, and act on what the measurement shows.',
    'The teaching itself is concept-first. Every rule is explained before it is drilled, because a rule you cannot justify is a rule you will misapply the moment a question is worded unfamiliarly. Every question — easy or hard — is answered with the same five-step routine, until the routine survives exam pressure. And every result, good or bad, is treated as information rather than as a verdict.',
    'The other half of the work is not teaching at all. It is watching: noticing when homework quality drops, when a confident student quietly stops asking questions, when a mock score swings for a reason nobody has named yet. That is the part that keeps a plan working, and it is why the system includes mentoring, advising, and a parent portal rather than leaving families to guess.',
  ],
} as const

export const APPROACH_MARKERS = [
  { label: 'Two exams, taught separately', detail: 'SAT and EST have different syllabi and question styles — and get different programs.' },
  { label: 'Four programs', detail: 'Basic and Advanced levels for each exam, entered on the evidence of a diagnostic.' },
  { label: 'A seven-stage journey', detail: 'From assessment to final preparation, with a defined purpose at every stage.' },
  { label: 'A five-step method', detail: 'READ · ANALYZE · PLAN · SOLVE · CHECK — used on every question, every time.' },
] as const

export const TEACHING_COMMITMENTS = [
  {
    title: 'No student is left guessing about their own progress',
    body: 'Students always know where they stand, what is weak, and what the next action is. Uncertainty is stressful and it is unnecessary.',
  },
  {
    title: 'No question is treated as a silly question',
    body: 'A student who feels safe asking is a student who improves. The room stays calm on purpose.',
  },
  {
    title: 'No result is hidden from the parent',
    body: 'Parents see the same evidence the teacher uses — attendance, homework, quizzes, mocks and the reasoning behind them.',
  },
  {
    title: 'No promises that cannot be kept',
    body: 'A specific score is never guaranteed. A structured process, honest measurement and real feedback are.',
  },
] as const

/**
 * ⚠️  OPTIONAL — leave empty until confirmed.
 * Fill with verified facts only (e.g. degree, years teaching, exam experience).
 * Anything added here renders on the About page as a credentials strip.
 */
export const OPTIONAL_CREDENTIALS: { label: string; value: string }[] = []
