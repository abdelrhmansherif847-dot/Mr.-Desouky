'use client'

import { useState } from 'react'
import { CONTACT, whatsappLink } from '@/content/site'
import { useScrolledPast, useSessionFlag } from '@/lib/hooks'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'wa-dismissed'

/**
 * Highly accessible, deliberately not intrusive:
 *  · never covers content on first paint — appears after a short scroll
 *  · collapses to a compact circle on mobile
 *  · dismissible, and stays dismissed for the session
 */
export function WhatsAppButton() {
  const scrolledPast = useScrolledPast(420)
  const previouslyDismissed = useSessionFlag(DISMISS_KEY)
  const [dismissedNow, setDismissedNow] = useState(false)

  const dismissed = previouslyDismissed || dismissedNow

  const dismiss = () => {
    setDismissedNow(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Storage unavailable — dismissal lasts for this page view only.
    }
  }

  if (dismissed) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-40 flex items-center gap-2 transition-all duration-500 ease-calm sm:bottom-6 sm:right-6',
        scrolledPast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Message Mr. Desouky on WhatsApp at ${CONTACT.whatsappDisplay}`}
        tabIndex={scrolledPast ? 0 : -1}
        className="group inline-flex items-center gap-2.5 rounded-full bg-growth-500 py-3 pl-3.5 pr-4 text-white shadow-lift transition-all duration-300 ease-calm hover:bg-growth-600 sm:pr-5"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 shrink-0">
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.13-.28-.2-.58-.35z" />
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23z" />
        </svg>
        <span className="hidden text-sm font-semibold sm:inline">WhatsApp</span>
      </a>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Hide the WhatsApp button"
        tabIndex={scrolledPast ? 0 : -1}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-deep-100 bg-white text-deep-400 shadow-card transition-colors duration-200 hover:bg-mist hover:text-deep-600"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
          <path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
