'use client'

import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

/**
 * Publishes the pointer's position on an element as two custom properties,
 * `--px` and `--py`, each running from -0.5 to 0.5 across the element.
 *
 * That is the whole of the JavaScript behind the screen's pointer response.
 * Every layer that reacts — the glow, the graph paper, the glyphs, the card —
 * multiplies these two numbers by its own small constant in CSS, so the
 * amplitude of each is a design decision in the stylesheet rather than
 * something computed per frame.
 *
 * Reads are coalesced into one animation frame, so a fast pointer costs one
 * layout read and two property writes per frame at most, and nothing runs at
 * all when the pointer is still.
 *
 * Nothing is published to a coarse pointer or to a visitor who has asked for
 * reduced motion; both simply get the fallback of 0, which is the neutral
 * position the CSS already describes.
 */
export function usePointerField<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (prefersReducedMotion()) return

    let frame = 0
    let clientX = 0
    let clientY = 0

    const write = (px: number, py: number) => {
      el.style.setProperty('--px', px.toFixed(3))
      el.style.setProperty('--py', py.toFixed(3))
    }

    const flush = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      write((clientX - rect.left) / rect.width - 0.5, (clientY - rect.top) / rect.height - 0.5)
    }

    const onMove = (event: PointerEvent) => {
      clientX = event.clientX
      clientY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(flush)
    }

    // Back to neutral, at the same unhurried rate as everything else — the
    // transition lives on the layers, so this is only a target, not a jump.
    const onLeave = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      write(0, 0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [ref])
}
