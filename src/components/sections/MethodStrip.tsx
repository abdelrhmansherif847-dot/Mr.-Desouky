import { Section, SectionHeading } from '@/components/ui/Section'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { GlyphMark } from '@/components/brand/MathTexture'
import { METHOD_STEPS, METHOD_SUMMARY } from '@/content/method'

/** Signature methodology, shown compactly on the home page. */
export function MethodStrip() {
  return (
    <Section tone="deep" grid id="method">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          tone="dark"
          eyebrow="The Desouky Method"
          title="Five steps. Every question. Every time."
          lead={METHOD_SUMMARY.body}
        />
        <ButtonLink href="/method" variant="onDark" className="group shrink-0 self-start lg:self-auto">
          Explore the method
          <ArrowRight />
        </ButtonLink>
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
        {METHOD_STEPS.map((step) => (
          <li
            key={step.id}
            className="group relative overflow-hidden rounded-card border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 ease-calm hover:border-sky-300/40 hover:bg-white/[0.08]"
          >
            <GlyphMark
              glyph={step.symbol}
              tone="dark"
              className="absolute -right-1 -top-2 text-6xl transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="relative">
              <span className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-sky-300">
                {step.index}
              </span>
              <h3 className="mt-2.5 font-display text-xl font-bold uppercase tracking-tight text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-deep-100/70">{step.tagline}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
