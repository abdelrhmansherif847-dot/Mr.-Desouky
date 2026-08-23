import Link from 'next/link'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { GlyphMark } from '@/components/brand/MathTexture'
import { PRIMARY_NAV } from '@/content/site'

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-paper">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 texture-grid mask-fade-b opacity-70" />

      <div className="container-page relative py-20 sm:py-28 lg:py-36">
        <div className="relative mx-auto max-w-2xl text-center">
          <GlyphMark
            glyph="≠"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] sm:text-[20rem]"
          />
          <div className="relative">
            <p className="eyebrow text-sky-600">Error 404</p>
            <h1 className="mt-4 text-display-lg text-deep-700">This page does not exist</h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-deep-500">
              The link may be out of date, or the address may have a typo in it. Everything on the
              site is reachable from the pages below.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/" size="lg" className="group w-full sm:w-auto">
                Back to home
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
                Contact Mr. Desouky
              </ButtonLink>
            </div>

            <nav aria-label="Site sections" className="mt-12 border-t border-deep-100 pt-8">
              <ul className="flex flex-wrap justify-center gap-2">
                {PRIMARY_NAV.filter((i) => i.href !== '/').map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-block rounded-full border border-deep-100 px-4 py-2 text-sm font-medium text-deep-600 transition-colors duration-200 hover:border-sky-300 hover:text-sky-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  )
}
