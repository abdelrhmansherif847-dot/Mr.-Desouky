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
}

export const AUDIENCE: Record<Audience, AudienceCopy> = {
  student: {
    switchLabel: 'Student',
    eyebrow: 'Student Portal',
    heading: 'Welcome back.',
    lead: 'Continue your learning journey with Mr. Desouky — your sessions, your homework, your results, and exactly what comes next.',
    cardLead: 'Sign in to pick up where you left off.',
    destination: '/student',
    previewHref: '/student',
    points: [
      'Where you are in the seven-stage journey',
      'Homework, quizzes and mock results as they happen',
      'Your weak topics, and the next action on each',
    ],
  },
  parent: {
    switchLabel: 'Parent',
    eyebrow: 'Parent Portal',
    heading: 'Welcome back.',
    lead: 'Stay connected to your student’s learning journey — attendance, effort and results, with the reasoning behind them.',
    cardLead: 'Sign in to see how your student is progressing.',
    destination: '/parent',
    previewHref: '/parent',
    points: [
      'Attendance and homework completion, session by session',
      'Quiz and mock performance, with the trend over time',
      'Written feedback after every quiz and mock',
    ],
  },
}
