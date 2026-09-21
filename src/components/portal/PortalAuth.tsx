'use client'

import { Fragment, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { MathTexture } from '@/components/brand/MathTexture'
import { ProgressPlot } from '@/components/brand/ProgressPlot'
import { LEARNING_LOOP } from '@/content/philosophy'
import { staggerDelay } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { AUDIENCE, type Audience } from './audience'
import { PortalSignInCard } from './PortalSignInCard'

/**
 * The Student / Parent authentication experience.
 *
 * Composition: a cinematic deep-blue field carrying the brand's own textures —
 * graph paper, mathematical glyphs, a single sky glow — with the sign-in card
 * lifted off it. On a phone the same field runs the full height and the
 * composition becomes vertical, so nothing is a squeezed desktop layout.
 *
 * Switching portal is state, not navigation: the card and copy cross-fade
 * instantly while the URL is corrected underneath with router.replace. A real
 * route change would remount the form and lose anything typed, and would make
 * the switch feel like leaving rather than choosing.
 *
 * Entrance uses the existing fade-up token with staggerDelay, so this page
 * moves in the same rhythm as the rest of the site. Reduced motion is handled
 * globally — animations are removed, not shortened, and nothing is left
 * invisible.
 */
export function PortalAuth({ initial }: { initial: Audience }) {
  const [audience, setAudience] = useState<Audience>(initial)
  const router = useRouter()
  const pathname = usePathname()
  const copy = AUDIENCE[audience]

  const change = (next: Audience) => {
    if (next === audience) return
    setAudience(next)
    const href = `/login/${next}`
    if (pathname !== href) router.replace(href, { scroll: false })
  }

  return (
    <section className="relative isolate flex min-h-[calc(100vh-4.5rem)] items-center overflow-hidden bg-deep-800">
      {/* ---------- Background, in layers, all decorative ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* 1 — the field itself, lit from the upper left rather than flat. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_12%_0%,#154063_0%,#0E2F4A_45%,#0A2137_100%)]" />

        {/* 2 — graph paper, the workbook underneath everything. */}
        <div className="absolute inset-0 texture-grid-dark opacity-[0.45] mask-fade-b" />

        {/* 3 — glyphs, in the margins only. */}
        <div className="absolute inset-x-0 bottom-0 h-[22%] opacity-50 lg:right-[58%] lg:top-[82%] lg:h-auto">
          <MathTexture tone="dark" density="sparse" ambient />
        </div>

        {/* 4 — one controlled focal glow, behind the card, so the eye lands
            where the work is. It breathes over 14s: felt, not watched. */}
        <div
          data-ambient=""
          className="absolute right-[-10%] top-[8%] h-[62vh] w-[62vw] rounded-full bg-sky-500/[0.13] blur-[130px] animate-ambient-breathe lg:right-[2%] lg:w-[44vw]"
        />
        <div className="absolute -left-[18%] top-[-12%] h-[48vh] w-[48vw] rounded-full bg-sky-400/[0.08] blur-[120px]" />

        {/* 5 — vignette, to seat the composition. */}
        <div className="absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_45%,transparent_35%,rgba(6,21,37,0.55)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-deep-900 to-transparent" />
      </div>

      <div className="container-page relative w-full py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_minmax(0,25rem)] lg:gap-16 xl:gap-20">
          {/* ---------- Left: the cinematic half ---------- */}
          <div className="max-w-xl">
            {/* Keyed on audience so the copy cross-fades when the portal changes. */}
            <div key={audience}>
              <p
                className="eyebrow flex items-center gap-2.5 animate-fade-up text-sky-300"
                style={{ animationDelay: `${staggerDelay(1)}ms` }}
              >
                <span
                  aria-hidden="true"
                  data-ambient=""
                  className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 animate-ambient-breathe"
                />
                {copy.eyebrow}
              </p>

              <h1
                className="mt-4 text-balance text-display-lg text-white animate-fade-up"
                style={{ animationDelay: `${staggerDelay(2)}ms` }}
              >
                {copy.heading}
              </h1>

              <p
                className="mt-5 max-w-md text-base leading-relaxed text-deep-100/75 animate-fade-up sm:text-[1.05rem]"
                style={{ animationDelay: `${staggerDelay(3)}ms` }}
              >
                {copy.lead}
              </p>

              <ul className="mt-8 space-y-3.5">
                {copy.points.map((point, index) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm text-deep-100/80 animate-fade-up"
                    style={{ animationDelay: `${staggerDelay(4 + index)}ms` }}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 ring-1 ring-inset ring-white/15">
                      <svg
                        viewBox="0 0 16 16"
                        className="h-3 w-3 text-growth-300"
                        aria-hidden="true"
                      >
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
            </div>

            <LearningLoop audience={audience} />
          </div>

          {/* ---------- Right: the card ---------- */}
          <div
            className="animate-fade-up lg:justify-self-end lg:w-full"
            style={{ animationDelay: `${staggerDelay(3)}ms` }}
          >
            <PortalSignInCard audience={audience} onAudienceChange={change} />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The brand's own four-step loop — as the axis a progress curve is plotted
 * against. Understand, Practice, Improve, Perform stop being a list and
 * become the horizontal scale of a real graph, which is the most honest way
 * this site can say "mathematics" and "progress" in one mark.
 *
 * Progress is what this whole system is about, so the one piece of motion that
 * is not an entrance says exactly that — it grows, once, in one direction,
 * and stops. grow-bar is the existing token used for every other progress bar
 * on the site, so this reads as the same idea, not a new one.
 */
function LearningLoop({ audience }: { audience: Audience }) {
  return (
    <div
      className="mt-10 animate-fade-up border-t border-white/10 pt-7"
      style={{ animationDelay: `${staggerDelay(5)}ms` }}
    >
      {/* The aspect is fixed and matches the plot's viewBox exactly, so the
          curve is never stretched and the points stay circular at any width. */}
      <div className="relative aspect-[4/1] w-full max-w-md">
        <ProgressPlot annotated={audience === 'parent'} />
      </div>

      <div className="mt-2.5 flex max-w-md items-center gap-2 sm:gap-3">
        {LEARNING_LOOP.map((step, index) => (
          <Fragment key={step}>
            <span className="shrink-0 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-deep-100/55 sm:text-[0.62rem] sm:tracking-[0.16em]">
              {step}
            </span>
            {index < LEARNING_LOOP.length - 1 ? (
              <span aria-hidden="true" className="h-px flex-1 overflow-hidden bg-white/12">
                <span
                  className={cn('block h-px w-full origin-left bg-sky-400/70 animate-grow-bar')}
                  style={{ animationDelay: `${600 + index * 160}ms` }}
                />
              </span>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
