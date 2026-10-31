'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * The scrolling box around the lesson rail beside a lesson. Taller courses
 * do not fit in the window, so on lessons near the end the current lesson
 * would open out of sight. This brings it into view inside the box only
 * (the page itself does not move), at once rather than animated.
 */
export function RailScroller({ current, className, children }: { current: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = ref.current
    const item = box?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!box || !item) return
    const b = box.getBoundingClientRect()
    const r = item.getBoundingClientRect()
    if (r.top < b.top || r.bottom > b.bottom) box.scrollTop += r.top - b.top - (b.height - r.height) / 2
  }, [current])

  return (
    <div ref={ref} className={className} data-testid="lesson-rail-scroller">
      {children}
    </div>
  )
}
