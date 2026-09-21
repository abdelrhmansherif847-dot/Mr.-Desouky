/**
 * MOTION SYSTEM
 * =============
 * One source of truth for every animation on the site. Nothing animates with
 * an ad-hoc duration or easing — if a value is not here, it does not exist.
 *
 * The principle: motion communicates progress, clarity and confidence.
 * A student moves forward and improves, so the motion moves forward too —
 * always in one direction, always settling, never bouncing or looping for
 * decoration.
 *
 * These values are mirrored as CSS custom properties in globals.css. Change
 * them in both places, or nowhere.
 */

/** Milliseconds. Short enough that nothing ever feels like waiting. */
export const DURATION = {
  /** Press feedback, colour changes. */
  instant: 120,
  /** Hover states, small affordances. */
  fast: 200,
  /** The default for interactive transitions. */
  base: 320,
  /** Page transitions, larger state changes. */
  slow: 420,
  /** Entrances: scroll reveals and first paint. */
  entrance: 620,
  /** Progress bars and rings filling — long enough to read as growth. */
  progress: 900,
  /** Count-ups. */
  count: 1100,
} as const

/**
 * `calm` is an expo-out curve: quick to commit, long to settle. It is what
 * makes the motion read as confident rather than eager.
 * `smooth` is the standard curve for reversible states like hover.
 */
export const EASING = {
  calm: 'cubic-bezier(0.16, 1, 0.3, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /**
   * The only curve on the site that overshoots. A segmented control is a
   * physical object being moved, and an object with mass settles rather than
   * arriving exactly. Reserved for that; everything else still settles from
   * one side.
   */
  spring: 'cubic-bezier(0.34, 1.42, 0.64, 1)',
} as const

/** Travel distance in px. Deliberately small — motion should be felt, not watched. */
export const DISTANCE = {
  sm: 8,
  md: 14,
  lg: 22,
} as const

/** Delay between staggered siblings, and the cap that stops long lists crawling. */
export const STAGGER = {
  step: 70,
  max: 6,
} as const

/** Delay for the nth item in a staggered group, capped. */
export function staggerDelay(index: number, step: number = STAGGER.step): number {
  return Math.min(index, STAGGER.max) * step
}

/** True when the visitor has asked for reduced motion. SSR-safe. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
