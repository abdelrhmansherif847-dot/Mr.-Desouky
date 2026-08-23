import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { Portrait } from '@/components/brand/Portrait'
import { MathTexture } from '@/components/brand/MathTexture'
import { SITE } from '@/content/site'
import { LEARNING_LOOP } from '@/content/philosophy'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* Calm, layered background — texture, never decoration for its own sake */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 texture-grid mask-fade-b opacity-70" />
        <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-sky-50/70 blur-3xl" />
        <MathTexture density="sparse" className="opacity-70" />
      </div>

      <div className="container-page relative py-14 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ---------- Copy ---------- */}
          <div className="lg:col-span-7">
            <p className="animate-fade-up eyebrow text-sky-600">
              <span aria-hidden="true" className="mr-2.5 inline-block h-px w-6 align-middle bg-sky-500/50" />
              {SITE.name}
            </p>

            <h1 className="mt-4 animate-fade-up text-display-xl text-deep-700 [animation-delay:60ms]">
              Learn Math.
              <br />
              Build Confidence.
              <br />
              <span className="text-sky-500">Achieve More.</span>
            </h1>

            <p className="mt-4 animate-fade-up font-display text-lg font-semibold text-deep-500 [animation-delay:100ms] sm:text-xl">
              {SITE.role}
            </p>

            <p className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-deep-500 [animation-delay:140ms] sm:text-lg">
              This is not a series of private lessons. It is a structured learning
              system — teaching, practice, honest measurement and real feedback —
              built so that every student knows exactly where they stand, what
              they are working on, and what comes next.
            </p>

            <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:180ms] sm:flex-row sm:items-center">
              <ButtonLink href="/programs" size="lg" className="group w-full sm:w-auto">
                Explore Programs
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="secondary" size="lg" className="w-full sm:w-auto">
                How It Works
              </ButtonLink>
            </div>

            {/* Understand → Practice → Improve → Perform */}
            <div className="mt-10 animate-fade-up border-t border-deep-100 pt-6 [animation-delay:220ms]">
              <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {LEARNING_LOOP.map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-deep-500">
                      {step}
                    </span>
                    {i < LEARNING_LOOP.length - 1 ? (
                      <span aria-hidden="true" className="text-sky-400">
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ---------- Portrait ---------- */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm animate-fade-in [animation-delay:200ms] lg:max-w-none">
              <Portrait treatment="frame" priority sizes="(min-width: 1024px) 28rem, 80vw" />

              {/* One quiet proof card — the system, not a sales claim */}
              <div className="absolute -bottom-6 -left-4 w-[13.5rem] rounded-card border border-deep-100 bg-white p-4 shadow-lift sm:-left-8 sm:w-60 sm:p-5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-sky-600">
                  The system
                </p>
                <p className="mt-2 font-display text-sm font-semibold leading-snug text-deep-700">
                  Seven stages from first assessment to exam day
                </p>
                <div className="mt-3 flex gap-1" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < 4 ? 'bg-growth-300' : 'bg-deep-100'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
