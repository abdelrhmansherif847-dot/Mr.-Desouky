'use client'

import { useRef, type ReactNode } from 'react'
import { MathTexture } from '@/components/brand/MathTexture'
import { staggerDelay } from '@/lib/motion'
import { usePointerField } from './usePointerField'

/**
 * The stage every account screen is set on: sign in, create an account,
 * reset a password, and the pending and suspended notices.
 *
 * A cinematic deep-blue field carrying the brand's own textures — graph
 * paper, mathematical glyphs, a single sky glow — with the card lifted off
 * it. One stage for all of them, so moving between these screens feels like
 * moving within one place rather than between forms.
 *
 * Three areas, not two columns:
 *
 *   intro   the eyebrow, the headline and one paragraph
 *   card    the thing to do
 *   detail  everything that supports it — the steps, the learning loop
 *
 * On a wide screen intro and detail share the left column and the card sits
 * to the right. Below that they stack as intro → card → detail, so on a phone
 * the form is reached after one short paragraph instead of after the whole
 * story, and there is never a sidebar.
 *
 * Entrance uses the existing fade-up token with staggerDelay, the same rhythm
 * as the rest of the site. Reduced motion is handled globally — animations
 * are removed, not shortened, and nothing is left invisible — and the pointer
 * response is never started for it.
 */
export function AuthStage({
  intro,
  detail,
  children,
}: {
  intro: ReactNode
  detail?: ReactNode
  children: ReactNode
}) {
  const field = useRef<HTMLElement>(null)
  usePointerField(field)

  return (
    <section
      ref={field}
      className="relative isolate flex min-h-[calc(100vh-4.5rem)] items-center overflow-hidden bg-deep-800"
    >
      <StageBackground />

      <div className="container-page relative w-full py-12 sm:py-16 lg:py-24">
        <div
          className={
            'grid items-center gap-x-16 gap-y-9 xl:gap-x-20 ' +
            "[grid-template-areas:'intro'_'card'_'detail'] " +
            'lg:grid-cols-[1.05fr_minmax(0,26rem)] lg:grid-rows-[auto_1fr] ' +
            "lg:[grid-template-areas:'intro_card'_'detail_card']"
          }
        >
          <div className="max-w-xl [grid-area:intro] lg:self-end">{intro}</div>

          {/* Capped in the single-column layout so the card never outweighs
              the message above it; the grid column is narrower above lg.
              The entrance lives on this element and the pointer lean on the
              inner one, because each is a transform. */}
          <div
            className="w-full max-w-md animate-fade-up [grid-area:card] lg:max-w-none lg:self-center"
            style={{ animationDelay: `${staggerDelay(3)}ms` }}
          >
            <div className="card-tilt">{children}</div>
          </div>

          {detail ? <div className="max-w-xl [grid-area:detail] lg:self-start">{detail}</div> : null}
        </div>
      </div>
    </section>
  )
}

/** The headline block, identical in rhythm on every account screen. */
export function StageIntro({
  eyebrow,
  title,
  lead,
  as: Heading = 'h1',
}: {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  as?: 'h1' | 'p'
}) {
  return (
    <>
      <p
        className="eyebrow flex items-center gap-2.5 animate-fade-up text-sky-300"
        style={{ animationDelay: `${staggerDelay(1)}ms` }}
      >
        <span
          aria-hidden="true"
          data-ambient=""
          className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 animate-ambient-breathe"
        />
        {eyebrow}
      </p>
      <Heading
        className="mt-4 text-balance text-display-lg text-white animate-fade-up"
        style={{ animationDelay: `${staggerDelay(2)}ms` }}
      >
        {title}
      </Heading>
      {lead ? (
        <p
          className="mt-5 max-w-md text-base leading-relaxed text-deep-100/80 animate-fade-up sm:text-[1.05rem]"
          style={{ animationDelay: `${staggerDelay(3)}ms` }}
        >
          {lead}
        </p>
      ) : null}
    </>
  )
}

/** A checklist on the dark field, with the same green ticks as the login screen. */
export function StagePoints({ points, from = 4 }: { points: string[]; from?: number }) {
  return (
    <ul className="space-y-3.5">
      {points.map((point, index) => (
        <li
          key={point}
          className="flex items-start gap-3 text-sm text-deep-100/85 animate-fade-up"
          style={{ animationDelay: `${staggerDelay(from + index)}ms` }}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 ring-1 ring-inset ring-white/15">
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-growth-300" aria-hidden="true">
              <path
                d="M3.5 8.5 6.5 11.5 12.5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {point}
        </li>
      ))}
    </ul>
  )
}

/** Background, in layers, all decorative. */
function StageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* 1 — the field itself, lit from the upper left rather than flat. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_0%,#154063_0%,#0E2F4A_45%,#0A2137_100%)]" />

      {/* 2 — graph paper, the workbook underneath everything. It moves against
          the pointer, which is what reads as depth: the paper is behind the
          glass, so it should appear to lag behind it. */}
      <div className="pointer-parallax absolute inset-0 texture-grid-dark opacity-[0.45] mask-fade-b [--parallax-x:-10px] [--parallax-y:-6px]" />

      {/* 3 — glyphs, in the margins only. They keep their own slow drift; the
          wrapper carries the pointer response so the two never fight over the
          same transform. */}
      <div className="pointer-parallax absolute inset-x-0 bottom-0 h-[22%] opacity-50 [--parallax-x:-16px] [--parallax-y:-9px] lg:right-[58%] lg:top-[82%] lg:h-auto">
        <MathTexture tone="dark" density="sparse" ambient />
      </div>

      {/* 4 — one controlled focal glow, behind the card, so the eye lands
          where the work is. It breathes over 14s and leans toward the pointer
          the furthest of any layer — it is light, not an object. */}
      <div
        data-ambient=""
        className="pointer-parallax absolute right-[-10%] top-[8%] h-[62vh] w-[62vw] rounded-full bg-sky-500/[0.13] blur-[130px] animate-ambient-breathe [--parallax-x:26px] [--parallax-y:18px] lg:right-[2%] lg:w-[44vw]"
      />
      {/* The counterweight, on its own 32-second drift and out of phase with
          everything else, so the field never pulses as one. */}
      <div
        data-ambient=""
        className="absolute -left-[18%] top-[-12%] h-[48vh] w-[48vw] rounded-full bg-sky-400/[0.08] blur-[120px] animate-ambient-drift-slow"
      />

      {/* 5 — vignette, to seat the composition. */}
      <div className="absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_45%,transparent_35%,rgba(6,21,37,0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-deep-900 to-transparent" />
    </div>
  )
}
