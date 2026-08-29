'use client'

import type { ElementType, ReactNode } from 'react'
import { useInView } from '@/lib/useInView'
import { staggerDelay } from '@/lib/motion'

/**
 * Reveals its children as they enter the viewport.
 *
 * The visual states live in CSS (`[data-reveal]` in globals.css), so this
 * component only decides *when* — which keeps the animation on the compositor
 * and off the main thread. It animates opacity and transform only, so it can
 * never cause layout shift.
 *
 * Without JavaScript, a <noscript> rule in the layout shows everything
 * immediately. Under `prefers-reduced-motion`, the same rule applies.
 */

export type RevealVariant = 'up' | 'fade' | 'left' | 'right' | 'scale'

type RevealProps = {
  children: ReactNode
  /** Direction of travel. All variants are small and settle upward-forward. */
  variant?: RevealVariant
  /** Delay in ms, or use `index` for evenly staggered siblings. */
  delay?: number
  index?: number
  className?: string
  as?: ElementType
  threshold?: number
  /** Forwarded so revealed blocks can still be anchor targets. */
  id?: string
  /** Merged with the reveal's own custom properties — e.g. grid placement. */
  style?: React.CSSProperties
}

export function Reveal({
  children,
  variant = 'up',
  delay,
  index,
  className,
  as: Tag = 'div',
  threshold,
  id,
  style,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>(
    threshold !== undefined ? { threshold } : undefined,
  )

  const resolvedDelay = delay ?? (index !== undefined ? staggerDelay(index) : 0)

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal={variant}
      data-revealed={inView ? '' : undefined}
      style={
        {
          ...style,
          ...(resolvedDelay ? { '--reveal-delay': `${resolvedDelay}ms` } : {}),
        } as React.CSSProperties
      }
      className={className}
    >
      {children}
    </Tag>
  )
}
