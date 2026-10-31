import type { CourseCurriculum } from './types'
import { SAT_MATH_BASIC } from './sat-math-basic'
import { SAT_MATH_ADVANCED } from './sat-math-advanced'
import { EST_MATH_BASIC } from './est-math-basic'
import { EST_MATH_ADVANCED } from './est-math-advanced'
import { ACT_MATH_BASIC } from './act-math-basic'
import { ACT_MATH_ADVANCED } from './act-math-advanced'

/** The six official courses: SAT, EST, ACT, each at Basic then Advanced. */
export const CURRICULA: readonly CourseCurriculum[] = [
  SAT_MATH_BASIC,
  SAT_MATH_ADVANCED,
  EST_MATH_BASIC,
  EST_MATH_ADVANCED,
  ACT_MATH_BASIC,
  ACT_MATH_ADVANCED,
]

export function getCurriculum(slug: string): CourseCurriculum | undefined {
  return CURRICULA.find((course) => course.slug === slug)
}
