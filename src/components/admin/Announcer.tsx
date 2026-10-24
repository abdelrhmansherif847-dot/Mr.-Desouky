'use client'

import { useEffect, useState } from 'react'

/**
 * A short confirmation for actions whose result moves the row out of view —
 * approving an account takes it off the pending list, unlinking removes the
 * chip, deleting removes the record. Without this the only feedback would be
 * something disappearing. Announced politely to screen readers; the fade is
 * switched off under reduced motion by the global motion rules.
 */
const EVENT = 'admin:announce'

export function announce(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }))
}

export function Announcer() {
  const [message, setMessage] = useState<string | null>(null)
  const [seq, setSeq] = useState(0)

  useEffect(() => {
    const onAnnounce = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail)
      setSeq((n) => n + 1)
    }
    window.addEventListener(EVENT, onAnnounce)
    return () => window.removeEventListener(EVENT, onAnnounce)
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 4500)
    return () => clearTimeout(timer)
  }, [message, seq])

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-5">
      {message ? (
        <p
          key={seq}
          className="page-enter pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-deep-800 px-4 py-2.5 text-sm font-medium text-white shadow-lift"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-growth-300" aria-hidden="true">
            <path d="M3.5 8.5 6.5 11.5 12.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {message}
        </p>
      ) : null}
    </div>
  )
}
