import type { CourseOutcome } from './types'

/**
 * Course-level learning outcomes, by course slug. Each is drafted only from
 * the titles of the lessons it names, and together they name every lesson.
 * All are drafts until the teacher approves them (Draft — Pending Teacher
 * Review).
 */
export const COURSE_OUTCOMES: Record<string, CourseOutcome[]> = {
  'sat-math-basic': [
    { text: 'Work with factors, exponents and polynomials, and use a calculator well', lessons: [1, 2, 3], review: 'draft' },
    {
      text: 'Solve linear, absolute value, quadratic and exponential equations, inequalities and systems',
      lessons: [4, 5, 6, 7, 8, 9],
      review: 'draft',
    },
    { text: 'Use function notation and transform functions', lessons: [10], review: 'draft' },
    {
      text: 'Solve percentage, probability, rate, work and ratio problems in real-world contexts',
      lessons: [11, 12, 13, 14, 22],
      review: 'draft',
    },
    {
      text: 'Apply the properties of lines, angles, triangles, polygons, circles and solids, with similarity and right-triangle trigonometry',
      lessons: [15, 16, 17, 18, 19, 20, 21],
      review: 'draft',
    },
    { text: 'Solve multi-step word problems and interpret data in graphs and tables', lessons: [23, 24], review: 'draft' },
  ],

  'sat-math-advanced': [
    { text: 'Manipulate advanced algebraic, rational and radical expressions', lessons: [1, 2, 5], review: 'draft' },
    {
      text: 'Analyze polynomial, exponential, logarithmic, quadratic and piecewise functions, and model with them',
      lessons: [3, 4, 6, 9, 13],
      review: 'draft',
    },
    { text: 'Solve advanced systems of equations and inequalities', lessons: [7, 8], review: 'draft' },
    { text: 'Work with sequences and series, complex numbers, and matrices and determinants', lessons: [10, 11, 12], review: 'draft' },
    {
      text: 'Apply conic sections, trigonometry, and coordinate, transformational and 3D geometry',
      lessons: [14, 15, 16, 17, 18],
      review: 'draft',
    },
    { text: 'Use probability, statistics and data analysis to interpret information', lessons: [19, 20, 22], review: 'draft' },
    {
      text: 'Solve multi-step problems with refined strategy and pacing, and complete a full-length mock exam',
      lessons: [21, 23, 24],
      review: 'draft',
    },
  ],

  'est-math-basic': [
    { text: 'Compute confidently with numbers, factors and multiples', lessons: [1, 2], review: 'draft' },
    { text: 'Simplify expressions and work with exponents and polynomials', lessons: [3, 7, 8], review: 'draft' },
    {
      text: 'Solve linear, absolute value, quadratic and simultaneous equations and inequalities',
      lessons: [4, 5, 6, 9, 11],
      review: 'draft',
    },
    { text: 'Use functions and recognize sequences and patterns', lessons: [10, 12], review: 'draft' },
    { text: 'Solve ratio, rate, proportion and percentage problems', lessons: [13, 14], review: 'draft' },
    {
      text: 'Apply coordinate geometry and the properties of lines, angles, triangles, polygons and circles',
      lessons: [15, 16, 17, 18, 19, 20],
      review: 'draft',
    },
    {
      text: 'Solve multi-step word problems, interpret data and complete a timed EST-style mock exam',
      lessons: [21, 22, 23, 24],
      review: 'draft',
    },
  ],

  'est-math-advanced': [
    { text: 'Manipulate rational and radical expressions and factor polynomials', lessons: [1, 2, 3, 4], review: 'draft' },
    {
      text: 'Analyze quadratic, polynomial, exponential, logarithmic and piecewise functions',
      lessons: [5, 6, 7, 8, 9],
      review: 'draft',
    },
    {
      text: 'Solve advanced systems, and work with sequences, series, matrices and complex numbers',
      lessons: [10, 11, 12, 13],
      review: 'draft',
    },
    { text: 'Apply conic sections, trigonometry, and analytic and 3D geometry', lessons: [14, 15, 16, 17, 18], review: 'draft' },
    { text: 'Use probability, statistics and data analysis', lessons: [19, 20, 22], review: 'draft' },
    { text: 'Model real-world problems and complete a timed EST-style mock exam', lessons: [21, 23, 24], review: 'draft' },
  ],

  'act-math-basic': [
    { text: 'Compute with numbers and simplify expressions, exponents, roots and polynomials', lessons: [1, 2, 5, 6], review: 'draft' },
    { text: 'Solve linear, quadratic and simultaneous equations and inequalities', lessons: [3, 4, 7, 9], review: 'draft' },
    { text: 'Use functions and recognize sequences', lessons: [8, 12], review: 'draft' },
    { text: 'Solve ratio, rate, proportion and percent problems', lessons: [10, 11], review: 'draft' },
    {
      text: 'Apply coordinate geometry, angles, triangles, polygons, circles and basic trigonometry',
      lessons: [13, 14, 15, 16, 17, 18, 19],
      review: 'draft',
    },
    {
      text: 'Solve word problems, read data, use test strategies and complete a timed ACT-style mock exam',
      lessons: [20, 21, 22, 23, 24],
      review: 'draft',
    },
  ],

  'act-math-advanced': [
    { text: 'Work with advanced expressions, equations and inequalities, including rational expressions', lessons: [1, 2], review: 'draft' },
    { text: 'Analyze composite, inverse, polynomial, exponential and logarithmic functions', lessons: [3, 4, 5], review: 'draft' },
    { text: 'Solve quadratic, higher-degree and simultaneous equations and inequalities', lessons: [6, 7], review: 'draft' },
    { text: 'Work with sequences and series, complex numbers and matrices', lessons: [8, 9, 10], review: 'draft' },
    { text: 'Apply conic sections, trigonometry, and analytic and 3D geometry', lessons: [11, 12, 13, 14], review: 'draft' },
    { text: 'Use probability, statistics and data interpretation', lessons: [15, 16, 18], review: 'draft' },
    {
      text: 'Solve advanced problems under time with real past ACT questions, and complete mini and full-length ACT-style mocks',
      lessons: [17, 19, 20, 21, 22, 23, 24],
      review: 'draft',
    },
  ],
}
