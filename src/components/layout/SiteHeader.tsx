'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useScrolledPast } from '@/lib/hooks'
import { LogoLink } from '@/components/brand/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { PORTAL_NAV, PRIMARY_NAV } from '@/content/site'
import { cn } from '@/lib/utils'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader() {
  const pathname = usePathname()
  const scrolled = useScrolledPast(8)
  const [open, setOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close every menu when the route changes. Adjusting state during render
  // is the React-recommended pattern here — an effect would render the open
  // menu once on the new page before closing it.
  const [renderedPath, setRenderedPath] = useState(pathname)
  if (renderedPath !== pathname) {
    setRenderedPath(pathname)
    setOpen(false)
    setOpenMenu(null)
  }

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setOpenMenu(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140)
  }

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ease-calm',
          scrolled
            ? 'border-b border-deep-100 bg-white/92 backdrop-blur-md'
            : 'border-b border-transparent bg-white',
        )}
      >
        <div className="container-page">
          <div className="flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
            <LogoLink />

            {/* ---------- Desktop navigation ---------- */}
            <nav aria-label="Main" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                {PRIMARY_NAV.map((item) => {
                  const active = isActive(pathname, item.href)
                  const hasChildren = Boolean(item.children?.length)

                  return (
                    <li
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => {
                        cancelClose()
                        if (hasChildren) setOpenMenu(item.href)
                      }}
                      onMouseLeave={hasChildren ? scheduleClose : undefined}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        aria-expanded={hasChildren ? openMenu === item.href : undefined}
                        onFocus={() => hasChildren && setOpenMenu(item.href)}
                        className={cn(
                          'group/nav relative flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-[0.9rem] font-medium transition-colors duration-200 ease-smooth',
                          active
                            ? 'text-sky-600'
                            : 'text-deep-600 hover:bg-deep-50 hover:text-deep-800',
                        )}
                      >
                        {item.label}
                        {hasChildren ? (
                          <svg
                            viewBox="0 0 12 12"
                            aria-hidden="true"
                            className={cn(
                              'h-2.5 w-2.5 opacity-60 transition-transform duration-300 ease-calm motion-reduce:transition-none',
                              openMenu === item.href && 'rotate-180',
                            )}
                          >
                            <path
                              d="M2.5 4.5 6 8l3.5-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-center animate-indicator-in rounded-full bg-sky-500"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-deep-200 transition-transform duration-300 ease-calm group-hover/nav:scale-x-100 motion-reduce:transition-none"
                          />
                        )}
                      </Link>

                      {hasChildren && openMenu === item.href ? (
                        <div
                          className="absolute left-0 top-full w-80 pt-3"
                          onMouseEnter={cancelClose}
                          onMouseLeave={scheduleClose}
                        >
                          <div className="animate-fade-up rounded-card border border-deep-100 bg-white p-2 shadow-lift">
                            {item.children!.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-mist"
                              >
                                <span className="block text-sm font-semibold text-deep-700">
                                  {child.label}
                                </span>
                                {child.description ? (
                                  <span className="mt-0.5 block text-xs leading-relaxed text-deep-400">
                                    {child.description}
                                  </span>
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* ---------- Desktop portal actions ---------- */}
            <div className="hidden items-center gap-2 xl:flex">
              <Link
                href={PORTAL_NAV[0].href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-[0.9rem] font-medium text-deep-600 transition-colors duration-200 hover:bg-deep-50 hover:text-deep-800"
              >
                {PORTAL_NAV[0].label}
              </Link>
              <ButtonLink href={PORTAL_NAV[1].href} variant="secondary" size="sm">
                {PORTAL_NAV[1].label}
              </ButtonLink>
            </div>

            {/* ---------- Mobile trigger ---------- */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="header-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-deep-100 text-deep-700 transition-colors duration-200 hover:bg-deep-50 xl:hidden"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={cn(
                    'absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-[transform,top] duration-300 ease-calm',
                    open ? 'top-1.5 rotate-45' : 'top-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-current transition-opacity duration-200',
                    open && 'opacity-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-[transform,top] duration-300 ease-calm',
                    open ? 'top-1.5 -rotate-45' : 'top-3',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/*
        ---------- Collapsed navigation ----------

        A dropdown that opens downward from the header, not a sidebar: the
        panel is full-bleed, attached to the header's lower edge, and slides
        out from behind it so it reads as the header extending rather than a
        separate surface arriving from the side.

        This MUST stay a sibling of <header>, never a child of it.

        When the page is scrolled the header gains `backdrop-blur-md`, and a
        backdrop-filter makes an element the containing block for every
        `position: fixed` descendant. Nested inside, the panel would resolve
        its offsets against the 72px header box instead of the viewport and
        collapse to zero height — so the menu opened correctly at the top of a
        page and silently opened *nothing* anywhere else.
      */}
      <div
        id="header-menu"
        inert={!open}
        aria-hidden={!open}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}
        className={cn(
          // Above the floating WhatsApp action (z-40), which otherwise painted
          // over the menu's own buttons, and below the header (z-50).
          'fixed inset-x-0 bottom-0 top-[4.5rem] z-[45] lg:top-20 xl:hidden',
          'transition-[opacity,visibility] duration-200 ease-smooth motion-reduce:transition-none',
          'bg-deep-900/20',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        <div
          className={cn(
            // Only as tall as its contents, so the dimmed page still shows
            // beneath it — a dropdown, not a full-height drawer.
            'max-h-full w-full overflow-y-auto overscroll-contain',
            'border-b border-deep-100 bg-white shadow-lift',
            'transition-transform duration-300 ease-calm motion-reduce:transition-none',
            // Sits tucked under the opaque header when closed, so opening
            // reads as the panel coming down out of the header itself.
            open ? 'translate-y-0' : '-translate-y-4',
          )}
        >
          <nav
            aria-label="Menu"
            // Closing on route change alone leaves the panel open when the
            // link points at the page you are already on — tapping "Home" from
            // Home looked like the menu had jammed.
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setOpen(false)
            }}
            className="container-page pb-8 pt-6"
          >
            {/* Balanced columns rather than one long list, so the panel stays
                wide and shallow like a mega menu instead of a tall stack. */}
            <ul className="gap-x-10 sm:columns-2 lg:columns-3">
              {PRIMARY_NAV.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href} className="mb-1 break-inside-avoid">
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-baseline justify-between gap-4 rounded-xl px-4 py-3 transition-colors duration-200 ease-smooth active:scale-[0.99] motion-reduce:active:scale-100',
                        active ? 'bg-sky-50 text-sky-700' : 'text-deep-700 hover:bg-mist',
                      )}
                    >
                      <span className="font-display text-lg font-semibold">{item.label}</span>
                      {active ? (
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sky-500">
                          here
                        </span>
                      ) : null}
                    </Link>

                    {item.children?.length ? (
                      <ul className="mb-2 ml-4 mt-1 space-y-0.5 border-l border-deep-100 pl-3">
                        {item.children.slice(1).map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-lg px-3 py-2 text-[0.92rem] text-deep-500 transition-colors duration-200 hover:bg-mist hover:text-deep-700"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 border-t border-deep-100 pt-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <p className="eyebrow mb-3 text-deep-400 sm:hidden">Portals</p>
              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3">
                {PORTAL_NAV.map((item) => (
                  <ButtonLink key={item.href} href={item.href} variant="secondary" size="sm">
                    {item.label}
                  </ButtonLink>
                ))}
              </div>
              <ButtonLink
                href="/contact"
                variant="primary"
                size="md"
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Book an assessment
              </ButtonLink>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
