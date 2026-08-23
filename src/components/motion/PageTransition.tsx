'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * A short, forward-moving transition between pages.
 *
 * It renders the <main> element itself rather than wrapping it, so the DOM
 * structure and layout are unchanged. Keying on the pathname restarts the
 * entrance on each navigation.
 *
 * Navigation is never delayed: this is an entrance for the page that has
 * already arrived, not a loading state in front of it. The page is
 * interactive from the first frame.
 */
export function PageTransition({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  const pathname = usePathname()

  return (
    <main key={pathname} id={id} className={`page-enter ${className ?? ''}`}>
      {children}
    </main>
  )
}
