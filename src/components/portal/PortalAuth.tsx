'use client'

import { Fragment, useState } from 'react'
import { ProgressPlot } from '@/components/brand/ProgressPlot'
import { LEARNING_LOOP } from '@/content/philosophy'
import { staggerDelay } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { AUDIENCE, type Audience } from './audience'
import { AudienceSwap } from './AudienceSwap'
import { AuthStage, StageIntro, StagePoints } from './AuthStage'
import { PortalSignInCard } from './PortalSignInCard'

/**
 * The Student / Parent authentication experience.
 *
 * Set on AuthStage, the field every account screen shares: the headline, then
 * the card, then the detail — side by side on a wide screen, stacked on a
 * phone with the card second, so it is reached without scrolling past the
 * whole story.
 *
 * Switching portal is state, and only state. The address is deliberately left
 * alone, which is a decision worth recording because the obvious alternatives
 * were both tried and both measured:
 *
 *   router.replace('/login/parent') — /login/student and /login/parent are
 *   separate route segments, so the router tore the page down and rebuilt it.
 *   The email field came back empty and the input was a different element.
 *
 *   history.replaceState — the same outcome. Called on its own, with no React
 *   involved at all, it still remounted the tree: the App Router treats an
 *   address change across segments as a navigation however it is made.
 *
 * So the address cannot follow the switch without emptying the form mid-use,
 * and the form matters more than the address bar. Each portal keeps its own
 * URL to arrive at, link to and reload into; once here, choosing between them
 * is a control on one screen rather than a trip to another page.
 *
 * The movement itself is directional: press Parent and the screen travels
 * right, press Student and it travels left — in both the indicator and the
 * copy, which move together. See AudienceSwap.
 *
 * Entrance uses the existing fade-up token with staggerDelay, so this page
 * moves in the same rhythm as the rest of the site. Reduced motion is handled
 * globally — animations are removed, not shortened, and nothing is left
 * invisible.
 */
export function PortalAuth({ initial }: { initial: Audience }) {
  const [audience, setAudience] = useState<Audience>(initial)

  return (
    <AuthStage
      intro={
        // Both portals' words live here; one is shown. See AudienceSwap for
        // why both are rendered and why nothing tracks direction.
        <AudienceSwap
          audience={audience}
          render={(value) => (
            <StageIntro
              eyebrow={AUDIENCE[value].eyebrow}
              title={AUDIENCE[value].heading}
              lead={AUDIENCE[value].lead}
            />
          )}
        />
      }
      detail={
        <>
          <AudienceSwap
            audience={audience}
            render={(value) => <StagePoints points={AUDIENCE[value].points} />}
          />
          <LearningLoop audience={audience} />
        </>
      }
    >
      <PortalSignInCard audience={audience} onAudienceChange={setAudience} />
    </AuthStage>
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
