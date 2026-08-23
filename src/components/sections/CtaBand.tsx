import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { MathTexture } from '@/components/brand/MathTexture'
import { SITE, whatsappLink } from '@/content/site'

type CtaBandProps = {
  eyebrow?: string
  title?: string
  body?: string
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string }
  /** Shows the WhatsApp option as the secondary action. */
  whatsapp?: boolean
}

export function CtaBand({
  eyebrow = 'Next step',
  title = 'Start with an assessment, not a guess',
  body = 'Every program begins by finding out exactly where the student stands. From there, the level, the plan and the timeline follow from evidence — not from assumption.',
  primary = { label: 'Explore Programs', href: '/programs' },
  secondary = { label: 'Contact Mr. Desouky', href: '/contact' },
  whatsapp = false,
}: CtaBandProps) {
  return (
    <section className="relative overflow-hidden bg-deep-700">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 texture-grid-dark opacity-50" />
        <MathTexture tone="dark" density="sparse" />
      </div>

      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-sky-300">{eyebrow}</p>
          <h2 className="mt-4 text-display-md text-white">{title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-deep-100/75 sm:text-lg">
            {body}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={primary.href} size="lg" className="group w-full sm:w-auto">
              {primary.label}
              <ArrowRight />
            </ButtonLink>

            {whatsapp ? (
              <ButtonLink
                href={whatsappLink()}
                external
                variant="onDark"
                size="lg"
                className="w-full sm:w-auto"
              >
                Message on WhatsApp
              </ButtonLink>
            ) : (
              <ButtonLink href={secondary.href} variant="onDark" size="lg" className="w-full sm:w-auto">
                {secondary.label}
              </ButtonLink>
            )}
          </div>

          <p className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-sky-300/70">
            {SITE.slogan}
          </p>
        </div>
      </div>
    </section>
  )
}
