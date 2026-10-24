import { PortalShell, type PortalNavItem } from '@/components/portal/PortalShell'
import type { ParentBase } from './base'

/**
 * The parent portal's frame, shared by the real portal and the preview.
 *
 * The navigation carries `?child=` from page to page, so a parent with more
 * than one child stays on the child they chose. It is only a selection: every
 * page re-checks it against the parent's own links before showing anything.
 */
export function ParentPortalLayout({
  base,
  parentName,
  childCount,
  children,
}: {
  base: ParentBase
  parentName: string
  /** null when the links could not be loaded. */
  childCount: number | null
  children: React.ReactNode
}) {
  const nav: PortalNavItem[] = [
    { label: 'Overview', href: base, icon: 'overview' },
    { label: 'Reports', href: `${base}/reports`, icon: 'reports' },
  ]

  const subtitle =
    childCount === null
      ? parentName
      : childCount === 0
        ? `${parentName} · waiting for a student link`
        : `${parentName} · ${childCount} student${childCount === 1 ? '' : 's'}`

  return (
    <PortalShell title="Parent Portal" subtitle={subtitle} nav={nav} keepQuery="child">
      {children}
    </PortalShell>
  )
}
