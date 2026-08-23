/**
 * RESOURCES — the public library.
 *
 * ⚠️  TODO: these entries describe the resource library structure. Attach real
 *     files/links by filling in `href` (or `file`) and setting `available: true`.
 *     Anything with `available: false` renders as "Coming soon" and is not
 *     presented as if it already exists.
 */

export type ResourceKind =
  | 'Practice Sheet'
  | 'Workbook'
  | 'Study Guide'
  | 'Math Tip'
  | 'Student Guide'
  | 'Video'
  | 'Article'
  | 'Exam Prep'

export type Resource = {
  id: string
  kind: ResourceKind
  title: string
  description: string
  track: 'SAT' | 'EST' | 'Both'
  level: 'Basic' | 'Advanced' | 'All'
  href?: string
  available: boolean
}

export const RESOURCE_CATEGORIES: { kind: ResourceKind; blurb: string }[] = [
  { kind: 'Practice Sheet', blurb: 'Focused question sets on a single topic, graded from foundation to exam level.' },
  { kind: 'Workbook', blurb: 'Full topic workbooks with worked examples, practice and answers.' },
  { kind: 'Study Guide', blurb: 'Condensed topic summaries — formulas, rules and the traps that go with them.' },
  { kind: 'Math Tip', blurb: 'Short, specific techniques that save time or prevent a common mistake.' },
  { kind: 'Student Guide', blurb: 'How to study, how to review a mistake, and how to prepare for exam week.' },
  { kind: 'Video', blurb: 'Recorded explanations of the concepts students ask about most.' },
  { kind: 'Article', blurb: 'Longer reading on method, preparation and exam decisions.' },
  { kind: 'Exam Prep', blurb: 'Timing plans, checklists and exam-day guidance.' },
]

export const RESOURCES: Resource[] = [
  {
    id: 'sat-linear-equations-sheet',
    kind: 'Practice Sheet',
    title: 'Linear Equations — Foundation Set',
    description: 'Twenty questions building from one-step equations to SAT-level word problems.',
    track: 'SAT',
    level: 'Basic',
    available: false,
  },
  {
    id: 'sat-quadratics-workbook',
    kind: 'Workbook',
    title: 'Quadratics Workbook',
    description: 'Factoring, the formula, the graph, and the question types each one appears in.',
    track: 'SAT',
    level: 'All',
    available: false,
  },
  {
    id: 'est-ratios-sheet',
    kind: 'Practice Sheet',
    title: 'Ratios, Rates & Proportion — EST Set',
    description: 'EST-style questions on the topic that quietly appears inside many others.',
    track: 'EST',
    level: 'Basic',
    available: false,
  },
  {
    id: 'formula-guide',
    kind: 'Study Guide',
    title: 'Formula & Rules Reference',
    description: 'Every formula worth memorising, grouped by topic, with the trap that usually accompanies it.',
    track: 'Both',
    level: 'All',
    available: false,
  },
  {
    id: 'method-guide',
    kind: 'Student Guide',
    title: 'Applying the Desouky Method',
    description: 'A one-page walkthrough of READ · ANALYZE · PLAN · SOLVE · CHECK on real questions.',
    track: 'Both',
    level: 'All',
    href: '/method',
    available: true,
  },
  {
    id: 'review-mistake-guide',
    kind: 'Student Guide',
    title: 'How to Review a Mistake Properly',
    description: 'The difference between looking at a correct answer and actually learning from a wrong one.',
    track: 'Both',
    level: 'All',
    available: false,
  },
  {
    id: 'timing-plan',
    kind: 'Exam Prep',
    title: 'Section Timing Plan',
    description: 'Where your minutes should go, and what to do when you fall behind.',
    track: 'Both',
    level: 'Advanced',
    available: false,
  },
  {
    id: 'exam-week-checklist',
    kind: 'Exam Prep',
    title: 'Exam Week Checklist',
    description: 'What to revise, what to stop revising, and what to prepare the night before.',
    track: 'Both',
    level: 'All',
    available: false,
  },
  {
    id: 'calculator-tips',
    kind: 'Math Tip',
    title: 'Using the Calculator Without Losing Time',
    description: 'When the calculator is faster, and the three cases where it is slower than your pen.',
    track: 'SAT',
    level: 'All',
    available: false,
  },
  {
    id: 'back-solving-tip',
    kind: 'Math Tip',
    title: 'Back-Solving From the Answer Choices',
    description: 'The technique that turns a two-minute algebra question into a twenty-second check.',
    track: 'Both',
    level: 'All',
    available: false,
  },
  {
    id: 'concept-videos',
    kind: 'Video',
    title: 'Concept Explanations',
    description: 'Short recorded explanations of the topics students ask about most often.',
    track: 'Both',
    level: 'All',
    available: false,
  },
  {
    id: 'choosing-level-article',
    kind: 'Article',
    title: 'Basic or Advanced — How the Level Is Decided',
    description: 'Why the diagnostic makes the decision, and what happens if the level turns out to be wrong.',
    track: 'Both',
    level: 'All',
    href: '/mentoring',
    available: true,
  },
]
