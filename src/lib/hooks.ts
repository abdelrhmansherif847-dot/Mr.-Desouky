'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribe to window scroll position without an effect.
 *
 * `useSyncExternalStore` is the right tool here: scroll is an external
 * system we read from, and it gives us a correct server snapshot for free
 * (no hydration mismatch, no setState-in-effect cascade).
 */
export function useScrolledPast(threshold: number): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener('scroll', onChange, { passive: true })
    return () => window.removeEventListener('scroll', onChange)
  }, [])

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold])

  // On the server nothing has scrolled yet.
  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Never changes after mount — sessionStorage is only written by this tab. */
const noopSubscribe = () => () => {}

/** Reads a boolean flag from sessionStorage, safely and without an effect. */
export function useSessionFlag(key: string): boolean {
  const getSnapshot = useCallback(() => {
    try {
      return sessionStorage.getItem(key) === '1'
    } catch {
      // Private mode or storage disabled — treat as unset.
      return false
    }
  }, [key])

  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot)
}
