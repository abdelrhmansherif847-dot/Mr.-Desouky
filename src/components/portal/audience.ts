/**
 * The two portals, side by side.
 *
 * Same brand system, different voice: a student is continuing their own work,
 * a parent is staying close to someone else's. Every string that differs
 * between them lives here, so the two screens cannot drift apart.
 */

import type { Destination } from '@/lib/auth/destinations'

export type Audience = 'student' | 'parent'

/**
 * In the order they appear in the control, which is also the order the sign-in
 * screen parks them in: Student on the left, Parent on the right.
 */
export const AUDIENCES = ['student', 'parent'] as const

type AudienceCopy = {
  switchLabel: string
  eyebrow: string
  /** Shared across both — the recognition is the same; what follows is not. */
  heading: string
  lead: string
  cardLead: string
  /**
   * Where a verified session lands. Typed against the allowlist, so a portal
   * cannot be given a destination the callback would refuse.
   */
  destination: Destination
  previewHref: string
  points: string[]
  /** The create-an-account screen: the same place, a different moment. */
  signup: {
    eyebrow: string
    heading: string
    lead: string
    cardTitle: string
    cardLead: string
  }
  /** The approval step, in this audience's terms. */
  approval: string
  /** What opens at the end of the path. */
  opens: string
}

export const AUDIENCE: Record<Audience, AudienceCopy> = {
  student: {
    switchLabel: 'Student',
    eyebrow: 'Student Portal',
    heading: 'Welcome back.',
    lead: 'Continue your learning journey with Mr. Desouky — your sessions, your homework, your results, and exactly what comes next.',
    cardLead: 'Sign in to pick up where you left off.',
    destination: '/student',
    previewHref: '/preview/student',
    points: [
      'Where you are in the seven-stage journey',
      'Homework, quizzes and mock results as they happen',
      'Your weak topics, and the next action on each',
    ],
    signup: {
      eyebrow: 'Student Portal · New account',
      heading: 'Start with a clear path.',
      lead: 'Create your account once. When Mr. Desouky approves it, your sessions, homework and results are waiting in one place.',
      cardTitle: 'Create a student account',
      cardLead: 'Takes a minute. Nothing opens until your account is approved.',
    },
    approval: 'Mr. Desouky reviews every new account personally.',
    opens: 'Your journey, homework, quizzes and mock results.',
  },
  parent: {
    switchLabel: 'Parent',
    eyebrow: 'Parent Portal',
    heading: 'Welcome back.',
    lead: 'Stay connected to your student’s learning journey — attendance, effort and results, with the reasoning behind them.',
    cardLead: 'Sign in to see how your student is progressing.',
    destination: '/parent',
    previewHref: '/preview/parent',
    points: [
      'Attendance and homework completion, session by session',
      'Quiz and mock performance, with the trend over time',
      'Written feedback after every quiz and mock',
    ],
    signup: {
      eyebrow: 'Parent Portal · New account',
      heading: 'Stay close to their progress.',
      lead: 'Create your account once. Mr. Desouky approves it and links it to your student, so what you see is always theirs.',
      cardTitle: 'Create a parent account',
      cardLead: 'Takes a minute. Nothing opens until your account is approved and linked.',
    },
    approval: 'Mr. Desouky approves your account and links it to your student.',
    opens: 'Attendance, results and written feedback, session by session.',
  },
}
