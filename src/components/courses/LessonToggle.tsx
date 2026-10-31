'use client'

import { useState } from 'react'

/** Opens or closes every lesson in the curriculum at once. */
export function LessonToggle({ targetId }: { targetId: string }) {
  const [open, setOpen] = useState(false)

  function toggle() {
    const next = !open
    document
      .getElementById(targetId)
      ?.querySelectorAll<HTMLDetailsElement>('details[data-lesson]')
      .forEach((lesson) => {
        lesson.open = next
      })
    setOpen(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-controls={targetId}
      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-deep-200 bg-white px-4 py-2 font-display text-sm font-semibold text-deep-700 transition-colors duration-200 ease-calm hover:border-deep-400 hover:bg-deep-50"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-sky-600" aria-hidden="true">
        <path
          d={open ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {open ? 'Collapse all lessons' : 'Expand all lessons'}
    </button>
  )
}
