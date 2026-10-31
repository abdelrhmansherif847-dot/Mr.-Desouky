import type { Exam, ExamFormat, SourceRef, TopicScope } from './types'

/**
 * The math test of each exam, described separately. Every fact names its
 * source and how far it has been checked; only `confirmed` facts are ever
 * shown to visitors.
 *
 * Checked on 2026-10-31. The publishers' sites (satsuite.collegeboard.org,
 * www.act.org, est.moe.gov.eg, estests.com) could not be opened from the
 * environment that drafted this file, so each fact below comes from search
 * excerpts of the named official document and is marked `to-confirm` until
 * someone reads it in the original.
 */

const COLLEGE_BOARD = 'College Board'

const SAT_SOURCES = {
  framework: {
    title: 'Assessment Framework for the Digital SAT Suite',
    publisher: COLLEGE_BOARD,
    url: 'https://satsuite.collegeboard.org/media/pdf/assessment-framework-for-digital-sat-suite.pdf',
    where: 'Math section: domains and skill/knowledge testing points',
  },
  specOverview: {
    title: 'Digital SAT Suite of Assessments Specifications Overview',
    publisher: COLLEGE_BOARD,
    url: 'https://satsuite.collegeboard.org/media/pdf/digital-sat-test-spec-overview.pdf',
  },
  mathSpecs: {
    title: 'Math Specifications (SAT Suite)',
    publisher: COLLEGE_BOARD,
    url: 'https://satsuite.collegeboard.org/k12-educators/about/alignment/math',
  },
  skillsInsight: {
    title: 'Skills Insight for the SAT Suite',
    publisher: COLLEGE_BOARD,
    url: 'https://satsuite.collegeboard.org/media/pdf/skills-insight-digital-sat-suite.pdf',
  },
} satisfies Record<string, SourceRef>

const ACT_SOURCES = {
  technicalManual: {
    title: 'ACT Technical Manual',
    publisher: 'ACT',
    url: 'https://www.act.org/content/dam/act/unsecured/documents/ACT_Technical_Manual.pdf',
    where: 'Mathematics test description',
  },
  sections: {
    title: 'What’s on the ACT Test?',
    publisher: 'ACT',
    url: 'https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/act-exam-sections-and-structure.html',
  },
  enhancementsFaq: {
    title: 'Enhanced ACT: FAQs',
    publisher: 'ACT',
    url: 'https://www.act.org/content/act/en/products-and-services/the-act-educator/the-act-test/enhancements-k12/faqs.html',
  },
  educatorGuide: {
    title: 'ACT Enhancements Educator Guide',
    publisher: 'ACT',
    url: 'https://www.act.org/content/dam/act/unsecured/documents/act-enhancements-educator-guide.pdf',
  },
  calculatorPolicy: {
    title: 'ACT Calculator Policy',
    publisher: 'ACT',
    url: 'https://www.act.org/content/dam/act/unsecured/documents/ACT-calculator-policy.pdf',
  },
  scores: {
    title: 'Understanding Your ACT Scores',
    publisher: 'ACT',
    url: 'https://www.act.org/content/act/en/products-and-services/the-act/scores/understanding-your-scores.html',
  },
} satisfies Record<string, SourceRef>

const EST_SOURCES = {
  ministry: {
    title: 'EST',
    publisher: 'Ministry of Education, Egypt',
    url: 'https://est.moe.gov.eg/',
  },
  faq: {
    title: 'EST Egypt: FAQs',
    publisher: 'Academic Assessment Ltd (estests.com)',
    url: 'https://egypt.estests.com/faqs',
    where: 'EST I and EST II sections',
  },
  description: {
    title: 'EST Description Document (2023)',
    publisher: 'Academic Assessment Ltd (estests.com)',
    url: 'https://resources.egypt.estests.com/References/EST-DescriptionDocument.pdf',
    where: 'Scoring and content sections',
  },
} satisfies Record<string, SourceRef>

const CHECKED_ON = '2026-10-31'

export const EXAM_FORMATS: Record<Exam, ExamFormat> = {
  SAT: {
    exam: 'SAT',
    fullName: 'SAT (digital)',
    mathTest: 'Math section',
    facts: [
      { label: 'Structure', value: 'Two separately timed modules', verification: 'to-confirm', sources: [SAT_SOURCES.specOverview] },
      { label: 'Questions', value: '44 (22 per module)', verification: 'to-confirm', sources: [SAT_SOURCES.specOverview, SAT_SOURCES.framework] },
      { label: 'Time', value: '70 minutes (35 per module)', verification: 'to-confirm', sources: [SAT_SOURCES.specOverview] },
      {
        label: 'Calculator',
        value: 'Allowed on the whole section; a graphing calculator is built into the test app',
        verification: 'to-confirm',
        sources: [SAT_SOURCES.specOverview],
      },
      {
        label: 'Question types',
        value: 'Multiple choice and student-produced response',
        verification: 'to-confirm',
        sources: [SAT_SOURCES.framework],
      },
      {
        label: 'Content domains',
        value: 'Algebra about 35%, Advanced Math about 35%, Problem-Solving and Data Analysis about 15%, Geometry and Trigonometry about 15%',
        verification: 'to-confirm',
        sources: [SAT_SOURCES.mathSpecs, SAT_SOURCES.framework],
      },
    ],
    openQuestions: [
      'The current edition and date of the Assessment Framework (v1.01, July 2022, or later).',
      'Score range, adaptive design, the share of student-produced responses, and whether each module includes unscored pretest questions.',
    ],
    checkedOn: CHECKED_ON,
  },

  EST: {
    exam: 'EST',
    fullName: 'EST (Egyptian Scholastic Test)',
    mathTest: 'EST I Math and EST II Math (Level 1, Level 2)',
    facts: [
      {
        label: 'What it is',
        value: 'A computer-based test that lets students in the American system qualify for admission to Egyptian higher education, delivered in collaboration with Pearson',
        verification: 'to-confirm',
        sources: [EST_SOURCES.ministry],
      },
      {
        label: 'EST I Math',
        value: '50 multiple-choice questions in 75 minutes; graphing or scientific calculator allowed',
        verification: 'to-confirm',
        sources: [EST_SOURCES.faq],
      },
      {
        label: 'EST II Math',
        value: 'Level 1 and Level 2: 40 multiple-choice questions in 60 minutes each',
        verification: 'to-confirm',
        sources: [EST_SOURCES.faq],
      },
      { label: 'Score range', value: '200–800 for each math test', verification: 'to-confirm', sources: [EST_SOURCES.description] },
    ],
    openQuestions: [
      'Which EST math test each course prepares for: EST I Math, EST II Math Level 1, or Level 2.',
      'The 2023 Description Document gives EST I Math as two parts (20 questions in 30 minutes without a calculator, 38 in 55 minutes with one) and EST II Math as 50 questions; the current FAQ gives 50 questions in 75 minutes and 40 questions. Revised 2026 specifications are announced but were not read.',
      'Who administers the test: the Ministry site names Pearson; the content and registration sit with Academic Assessment Ltd (estests.com).',
    ],
    checkedOn: CHECKED_ON,
  },

  ACT: {
    exam: 'ACT',
    fullName: 'ACT (enhanced)',
    mathTest: 'Mathematics test',
    facts: [
      {
        label: 'Questions',
        value: '45 (41 scored and 4 field-test)',
        verification: 'to-confirm',
        sources: [ACT_SOURCES.technicalManual, ACT_SOURCES.sections],
      },
      { label: 'Time', value: '50 minutes', verification: 'to-confirm', sources: [ACT_SOURCES.technicalManual, ACT_SOURCES.sections] },
      {
        label: 'Answer choices',
        value: 'Four per question, from the September 2025 test',
        verification: 'to-confirm',
        sources: [ACT_SOURCES.educatorGuide],
      },
      {
        label: 'Calculator',
        value: 'Permitted under ACT’s calculator policy; computer algebra system models are prohibited',
        verification: 'to-confirm',
        sources: [ACT_SOURCES.technicalManual, ACT_SOURCES.calculatorPolicy],
      },
      { label: 'Score range', value: '1–36', verification: 'to-confirm', sources: [ACT_SOURCES.scores] },
      {
        label: 'Reporting categories',
        value: 'Preparing for Higher Math 80% (Number and Quantity 10–12%, Algebra 17–20%, Functions 17–20%, Geometry 17–20%, Statistics and Probability 12–15%); Integrating Essential Skills 20%; Modeling 20% or more, counted within the others',
        verification: 'to-confirm',
        sources: [ACT_SOURCES.enhancementsFaq],
      },
      {
        label: 'Format in use',
        value: 'The enhanced ACT: national online testing from April 2025, paper from September 2025',
        verification: 'to-confirm',
        sources: [ACT_SOURCES.enhancementsFaq],
      },
    ],
    openQuestions: ['ACT’s own sentence on the change to four answer choices was not captured.'],
    checkedOn: CHECKED_ON,
  },
}

/**
 * SAT Math – Advanced topics that touch logarithms, sequences and series,
 * matrices or conic sections, classified against the Digital SAT Math
 * specification for the owner's and teacher's review.
 *
 * A proposal only: every topic stays in the curriculum whatever its label,
 * and no label is shown to visitors until it is both confirmed against the
 * College Board's own text and approved.
 */
const NOT_READ = 'Official text not yet read; based on search excerpts of the documents cited.'
const SAT_CORE_SOURCES = [SAT_SOURCES.framework, SAT_SOURCES.mathSpecs]

export const SAT_TOPIC_SCOPE: TopicScope[] = [
  {
    lessonId: 'sat-advanced-L06',
    topic: 0,
    proposed: 'extension',
    basis: `Logarithms are not listed in Advanced Math, whose nonlinear equations and functions include exponential ones, nor in any other domain. ${NOT_READ}`,
    verification: 'to-confirm',
    sources: SAT_CORE_SOURCES,
    review: 'pending',
  },
  {
    lessonId: 'sat-advanced-L06',
    topic: 1,
    proposed: 'mixed',
    basis: `Exponential equations are core (Advanced Math: nonlinear equations); log equations are extension. ${NOT_READ}`,
    verification: 'to-confirm',
    sources: SAT_CORE_SOURCES,
    review: 'pending',
  },
  {
    lessonId: 'sat-advanced-L06',
    topic: 2,
    proposed: 'core',
    basis: `Exponential growth and decay are nonlinear functions under Advanced Math. ${NOT_READ}`,
    verification: 'to-confirm',
    sources: SAT_CORE_SOURCES,
    review: 'pending',
  },
  {
    lessonId: 'sat-advanced-L06',
    topic: 3,
    proposed: 'mixed',
    basis: `Applications of exponential functions are core; applications that need logarithms are extension. ${NOT_READ}`,
    verification: 'to-confirm',
    sources: SAT_CORE_SOURCES,
    review: 'pending',
  },
  {
    lessonId: 'sat-advanced-L10',
    topic: 2,
    proposed: 'extension',
    basis: `Series and sigma notation are not listed in any Math domain. ${NOT_READ}`,
    verification: 'to-confirm',
    sources: SAT_CORE_SOURCES,
    review: 'pending',
  },
  ...[0, 1, 3].map(
    (topic): TopicScope => ({
      lessonId: 'sat-advanced-L12',
      topic,
      proposed: 'extension',
      basis: `Matrices and determinants are not listed in any Math domain. ${NOT_READ}`,
      verification: 'to-confirm',
      sources: SAT_CORE_SOURCES,
      review: 'pending',
    }),
  ),
  {
    lessonId: 'sat-advanced-L12',
    topic: 2,
    proposed: 'mixed',
    basis: `Systems of linear equations are core (Algebra); solving them with matrices is extension. ${NOT_READ}`,
    verification: 'to-confirm',
    sources: SAT_CORE_SOURCES,
    review: 'pending',
  },
  ...[0, 1, 2].map(
    (topic): TopicScope => ({
      lessonId: 'sat-advanced-L14',
      topic,
      proposed: 'mixed',
      basis: `Circles, including their equations in the xy-plane, are core (Geometry and Trigonometry), and parabolas are core as graphs of quadratic functions (Advanced Math); ellipses and hyperbolas are not listed, so they are extension. ${NOT_READ}`,
      verification: 'to-confirm',
      sources: [...SAT_CORE_SOURCES, SAT_SOURCES.skillsInsight],
      review: 'pending',
    }),
  ),
]
