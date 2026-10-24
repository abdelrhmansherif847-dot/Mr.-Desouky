'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

/**
 * Shown when a portal page cannot load its records. It never repeats the
 * underlying error — that is logged on the server — and it says plainly that
 * nothing was lost, because a blank dashboard reads as "my results are gone".
 */
export function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Move focus to the message so screen readers announce it.
    document.getElementById('portal-error-title')?.focus()
  }, [])

  return (
    <section
      role="alert"
      className="rounded-panel border border-deep-100 bg-white px-6 py-10 text-center sm:px-10 sm:py-12"
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mist ring-1 ring-inset ring-deep-100">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-deep-400" aria-hidden="true">
          <path
            d="M12 8v4m0 3.5h.01M4.5 19.5h15L12 4.5l-7.5 15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 id="portal-error-title" tabIndex={-1} className="mt-4 font-display text-lg font-bold text-deep-700 outline-none">
        Your records could not be loaded just now
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-deep-500">
        Nothing has been lost — this is a connection problem on our side. Try again in a moment. If it
        keeps happening, let Mr. Desouky know.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" size="sm" onClick={reset}>
          Try again
        </Button>
        <Link href="/contact" className="link-underline py-2 text-sm font-semibold text-sky-700">
          Contact
        </Link>
      </div>
    </section>
  )
}
