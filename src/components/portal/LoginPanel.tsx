import Link from 'next/link'
import { LogoMark } from '@/components/brand/Logo'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { MathTexture } from '@/components/brand/MathTexture'
import { CONTACT, whatsappLink } from '@/content/site'

/**
 * Login is intentionally NOT implemented — see src/lib/portal/auth.ts.
 * Rather than shipping a form that looks like a login but authenticates
 * nothing, this screen is honest about the state and routes people to the
 * preview and to a real human.
 */
export function LoginPanel({
  audience,
  previewHref,
  points,
}: {
  audience: 'Student' | 'Parent'
  previewHref: string
  points: string[]
}) {
  return (
    <div className="relative overflow-hidden bg-deep-700">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 texture-grid-dark opacity-50" />
        <MathTexture tone="dark" density="sparse" />
      </div>

      <div className="container-page relative py-14 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left — what the portal is for */}
          <div className="flex flex-col justify-center">
            <LogoMark variant="mono" size="lg" className="text-white" />
            <h1 className="mt-7 text-display-md text-white">{audience} Portal</h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-deep-100/75">
              {audience === 'Student'
                ? 'Your journey, your sessions, your homework, your results — and what to do next. In one place, updated as the work happens.'
                : 'Attendance, homework completion, quiz performance, mock scores and the reasoning behind them — without having to ask.'}
            </p>

            <ul className="mt-8 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-deep-100/80">
                  <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-growth-300" aria-hidden="true">
                    <path
                      d="M3.5 8.5 6.5 11.5 12.5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — honest status card */}
          <div className="rounded-panel border border-white/10 bg-white p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-50 px-3 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-olive-700 ring-1 ring-inset ring-olive-200/70">
              Not yet live
            </span>

            <h2 className="mt-5 font-display text-xl font-bold text-deep-700">
              Logins are not open yet
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-deep-500">
              The {audience.toLowerCase()} portal is built and can be explored below with sample
              data. Accounts open once it is connected to live records — until then there is no
              sign-in, because a login that authenticates nothing would only be misleading.
            </p>

            <div className="mt-7 space-y-3">
              <ButtonLink href={previewHref} size="lg" className="group w-full">
                Explore the preview
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href={whatsappLink()} external variant="secondary" size="lg" className="w-full">
                Ask about access
              </ButtonLink>
            </div>

            <div className="mt-7 border-t border-deep-100 pt-5">
              <p className="text-xs leading-relaxed text-deep-400">
                Already a student or parent here? Message{' '}
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline font-semibold text-sky-600"
                >
                  {CONTACT.whatsappDisplay}
                </a>{' '}
                and you will be told as soon as accounts open. Progress reports continue by
                message in the meantime.
              </p>
              <Link
                href={audience === 'Student' ? '/login/parent' : '/login/student'}
                className="mt-4 inline-block py-1 text-xs font-semibold text-deep-500 hover:text-sky-600"
              >
                {audience === 'Student' ? 'Looking for the parent portal?' : 'Looking for the student portal?'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
