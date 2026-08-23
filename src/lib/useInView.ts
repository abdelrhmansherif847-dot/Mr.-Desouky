'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Fires once when an element scrolls into view.
 *
 * A single shared IntersectionObserver per configuration keeps this cheap on
 * pages with many revealed sections — one observer, not one per element.
 */

type Options = {
  /**
   * Fraction of the element that must be visible.
   *
   * Kept low so an element taller than the viewport still qualifies: the ratio
   * is visible-area over element-area, so a large threshold would be
   * unreachable for a tall block and it would never reveal.
   */
  threshold?: number
  /**
   * Holds the reveal until the element is a little way inside the viewport,
   * so the animation is not spent off-screen.
   *
   * This is a fixed pixel value, never a percentage: a percentage grows with
   * the viewport, and on a tall screen it creates a band at the bottom where
   * content sits fully visible but never triggers — permanently invisible if
   * the page is too short to scroll.
   */
  rootMargin?: string
  /** Skip observing entirely and report visible immediately. */
  disabled?: boolean
}

const observers = new Map<string, IntersectionObserver>()
const callbacks = new WeakMap<Element, () => void>()

function getObserver(threshold: number, rootMargin: string): IntersectionObserver {
  const key = `${threshold}|${rootMargin}`
  let observer = observers.get(key)
  if (!observer) {
    observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          callbacks.get(entry.target)?.()
          callbacks.delete(entry.target)
          obs.unobserve(entry.target)
        }
      },
      { threshold, rootMargin },
    )
    observers.set(key, observer)
  }
  return observer
}

export function useInView<T extends HTMLElement>({
  threshold = 0.08,
  rootMargin = '0px 0px -40px 0px',
  disabled = false,
}: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // No observer support, or explicitly disabled: show it rather than leave
    // content hidden. Deferred a frame so the state change happens in a
    // callback, not synchronously inside the effect.
    if (disabled || typeof IntersectionObserver === 'undefined') {
      const raf = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(raf)
    }

    const observer = getObserver(threshold, rootMargin)
    callbacks.set(element, () => setInView(true))
    observer.observe(element)

    return () => {
      callbacks.delete(element)
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, disabled])

  return { ref, inView }
}
