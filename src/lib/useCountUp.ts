'use client'

import { useEffect, useRef, useState } from 'react'
import { DURATION, prefersReducedMotion } from '@/lib/motion'

/**
 * Animates a number toward its target once `active` is true.
 *
 * Shared by <CountUp> and by ProgressRing, so a ring and the figure inside it
 * run off one trigger and stay in step rather than drifting apart.
 */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export function useCountUp(
  target: number,
  active: boolean,
  duration: number = DURATION.count,
): number {
  const [value, setValue] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return

    // Reduced motion: land on the final figure immediately. Deferred a frame
    // so the state change happens in a callback rather than synchronously.
    if (prefersReducedMotion()) {
      const raf = requestAnimationFrame(() => setValue(target))
      return () => cancelAnimationFrame(raf)
    }

    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(target * easeOut(progress))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [active, target, duration])

  return value
}
