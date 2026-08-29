'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/brand/Logo'
import { SITE } from '@/content/site'
import { cn } from '@/lib/utils'

/**
 * Chrome for the internal admin area.
 *
 * Same design language as the public site — same tokens, type and motion —
 * but deliberately a different product: a dense working surface with its own
 * navigation, no marketing links, and no route back into the site header.
 */

export type AdminNavItem = { label: string; href: string; icon: keyof typeof ICONS }

const ICONS = {
  overview: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z',
  schedule: 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  students: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 0c-3.5 0-6.5 2.2-6.5 5V20h13v-3c0-2.8-3-5-6.5-5Z',
} as const

function Icon({ name }: { name: AdminNavItem['icon'] }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true">
      <path d={ICONS[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Overview', href: '/admin', icon: 'overview' },
  { label: 'Schedule', href: '/admin/schedule', icon: 'schedule' },
]

export function AdminShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-dvh flex-col bg-mist">
      {/* Deep header — visually distinct from the public site at a glance */}
      <header className="border-b border-white/10 bg-deep-800">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LogoMark variant="mono" size="sm" className="text-white" />
              <div className="leading-none">
                <p className="font-display text-sm font-bold text-white">{SITE.shortName}</p>
                <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-sky-300">
                  Admin
                </p>
              </div>
            </div>

            <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white/70">
              Internal
            </span>
          </div>

          <nav aria-label="Admin" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <ul className="flex min-w-max gap-1 pb-px">
              {ADMIN_NAV.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center gap-2 whitespace-nowrap rounded-t-lg px-3.5 py-3 text-sm font-medium',
                        'transition-colors duration-200 ease-smooth',
                        active ? 'text-white' : 'text-deep-100/60 hover:text-white',
                      )}
                    >
                      <Icon name={item.icon} />
                      {item.label}
                      {active ? (
                        <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-sky-400" />
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        <div className="container-page py-8 sm:py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-deep-700 sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-1.5 text-sm text-deep-500">{subtitle}</p> : null}
            </div>
            {actions}
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </main>

      <footer className="border-t border-deep-100 bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5">
          <p className="text-xs text-deep-400">Internal tools — not part of the public website.</p>
          <Link href="/" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
            View the public site
          </Link>
        </div>
      </footer>
    </div>
  )
}
