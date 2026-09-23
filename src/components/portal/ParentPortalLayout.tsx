import { PortalShell, type PortalNavItem } from '@/components/portal/PortalShell'
import { getParentRecord } from '@/lib/portal/data'
import type { ParentBase } from './base'

/** The parent portal's frame, shared by the real portal and the preview. */
export async function ParentPortalLayout({
  base,
  children,
}: {
  base: ParentBase
  children: React.ReactNode
}) {
  const record = await getParentRecord()

  const nav: PortalNavItem[] = [
    { label: 'Overview', href: base, icon: 'overview' },
    { label: 'Reports', href: `${base}/reports`, icon: 'reports' },
  ]

  return (
    <PortalShell
      title="Parent Portal"
      subtitle={`${record.parentName} · ${record.children.length} student${
        record.children.length === 1 ? '' : 's'
      }`}
      nav={nav}
    >
      {children}
    </PortalShell>
  )
}
