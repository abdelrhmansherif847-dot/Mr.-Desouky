'use client'

import { useInView } from '@/lib/useInView'
import { useCountUp } from '@/lib/useCountUp'
import { DURATION } from '@/lib/motion'

/**
 * Counts a number up when it scrolls into view.
 *
 * Used only where a figure represents progress the student has actually made —
 * attendance, completion, scores. It is not applied to dates, counts of things,
 * or anything where watching digits move would be noise rather than meaning.
 *
 * Layout shift is prevented by reserving the final width up front, so the
 * surrounding text never reflows as the digits grow.
 */

export function CountUp({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = DURATION.count as number,
  className,
}: {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  className?: string
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.3 })
  const display = useCountUp(value, inView, duration)

  const final = `${prefix}${value.toFixed(decimals)}${suffix}`
  const shown = `${prefix}${display.toFixed(decimals)}${suffix}`

  return (
    <span
      ref={ref}
      className={className}
      // Reserve the final width so growing digits never reflow the line.
      style={{ display: 'inline-block', minWidth: `${final.length}ch` }}
    >
      {/* Screen readers get the real figure, not a stream of changing numbers. */}
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{final}</span>
    </span>
  )
}
