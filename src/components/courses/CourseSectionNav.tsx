'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type CourseNavItem = { id: string; label: string }

/**
 * The in-page route through a course: Overview → Curriculum → Assessment →
 * Resources → Progress → Enrol. Sticks under the site header and marks the
 * section currently in view. Plain anchor links, so it works without
 * JavaScript too.
 */
export function CourseSectionNav({ items }: { items: CourseNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0 || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // The topmost visible section wins.
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        setActive(visible[0].target.id)
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  return (
    <nav
      aria-label="Course sections"
      className="sticky top-[var(--header-h,4.5rem)] z-30 border-y border-deep-100 bg-white/90 backdrop-blur-md"
    >
      <div className="container-page">
        <ol className="-mx-1 flex items-center gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, i) => {
            const isActive = item.id === active
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'group inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-display text-sm font-semibold transition-colors duration-200 ease-calm',
                    isActive ? 'bg-deep-700 text-white' : 'text-deep-500 hover:bg-deep-50 hover:text-deep-700',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'font-mono text-[0.62rem] tracking-[0.12em]',
                      isActive ? 'text-sky-300' : 'text-deep-300 group-hover:text-sky-600',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
