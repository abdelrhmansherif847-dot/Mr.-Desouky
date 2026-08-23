import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { CONTACT, PORTAL_NAV, PRIMARY_NAV, SECONDARY_NAV, SITE, whatsappLink } from '@/content/site'
import { PROGRAMS } from '@/content/programs'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-deep-800 text-deep-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 texture-grid-dark mask-fade-b opacity-60"
      />

      <div className="container-page relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <Logo variant="mono" size="lg" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-deep-100/70">
              {SITE.description}
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.28em] text-sky-300">
              {SITE.slogan}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8 lg:gap-8">
            <div>
              <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                Explore
              </h2>
              <ul className="mt-4 space-y-2.5">
                {PRIMARY_NAV.filter((i) => i.href !== '/').map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-underline inline-block py-1 text-sm text-deep-100/80 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {SECONDARY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-underline inline-block py-1 text-sm text-deep-100/80 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                Programs
              </h2>
              <ul className="mt-4 space-y-2.5">
                {PROGRAMS.map((program) => (
                  <li key={program.slug}>
                    <Link
                      href={`/programs/${program.slug}`}
                      className="link-underline inline-block py-1 text-sm text-deep-100/80 transition-colors duration-200 hover:text-white"
                    >
                      {program.title}
                    </Link>
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                Portals
              </h2>
              <ul className="mt-4 space-y-2.5">
                {PORTAL_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-underline inline-block py-1 text-sm text-deep-100/80 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                Contact
              </h2>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline inline-block py-1 text-sm text-deep-100/80 transition-colors duration-200 hover:text-white"
                  >
                    WhatsApp · {CONTACT.whatsappDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="link-underline inline-block py-1 text-sm text-deep-100/80 transition-colors duration-200 hover:text-white"
                  >
                    {CONTACT.email}
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="link-underline inline-block py-1 text-sm text-deep-100/80 transition-colors duration-200 hover:text-white"
                  >
                    Contact form
                  </Link>
                </li>
              </ul>

              <h2 className="mt-8 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                Follow
              </h2>
              <ul className="mt-4 space-y-2.5">
                {CONTACT.social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline inline-block py-1 text-sm text-deep-100/80 transition-colors duration-200 hover:text-white"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-deep-100/50">
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p className="max-w-md text-xs leading-relaxed text-deep-100/50">
            Structured preparation, honest measurement and clear feedback — no guaranteed scores.
          </p>
        </div>
      </div>
    </footer>
  )
}
