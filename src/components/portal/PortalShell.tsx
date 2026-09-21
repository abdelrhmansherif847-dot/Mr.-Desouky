'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export type PortalNavItem = { label: string; href: string; icon: keyof typeof ICONS }

const ICONS = {
  overview: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z',
  journey: 'M5 19V5m0 0 4 3-4 3m14 8V5m0 0-4 3 4 3M9 19h6',
  sessions: 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  homework: 'M6 4h9l4 4v12H6V4Zm9 0v4h4M9 13h7M9 17h5',
  quizzes: 'M9 11l2 2 4-4m-9 9h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1Z',
  mocks: 'M4 19V9m5 10V5m5 14v-7m5 7V7',
  reports: 'M5 4h14v16H5V4Zm4 5h6M9 13h6M9 17h3',
} as const

function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-[1.05rem] w-[1.05rem]', className)} aria-hidden="true">
      <path
        d={ICONS[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PortalShell({
  title,
  subtitle,
  nav,
  children,
  meta,
}: {
  title: string
  subtitle: string
  nav: PortalNavItem[]
  children: React.ReactNode
  meta?: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="bg-mist">
      {/* Portal header */}
      <div className="border-b border-deep-100 bg-white">
        <div className="container-page py-7 sm:py-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-deep-700 sm:text-2xl">{title}</h1>
              <p className="mt-0.5 text-sm text-deep-500">{subtitle}</p>
            </div>
            {meta ? <div className="shrink-0">{meta}</div> : null}
          </div>
        </div>

        {/* Portal navigation — scrolls horizontally on small screens */}
        <div className="container-page">
          <nav aria-label="Portal" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <ul className="flex min-w-max gap-1 pb-px">
              {nav.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center gap-2 whitespace-nowrap rounded-t-lg px-3.5 py-3 text-sm font-medium transition-colors duration-200 sm:px-4',
                        active
                          ? 'text-sky-600'
                          : 'text-deep-500 hover:bg-mist hover:text-deep-700',
                      )}
                    >
                      <Icon name={item.icon} />
                      {item.label}
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-sky-500"
                        />
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div className="container-page py-8 sm:py-10 lg:py-12">{children}</div>
    </div>
  )
}
