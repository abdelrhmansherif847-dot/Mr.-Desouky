import type { Metadata } from 'next'
import { PortalShell, type PortalNavItem } from '@/components/portal/PortalShell'
import { getParentRecord } from '@/lib/portal/data'

export const metadata: Metadata = {
  title: 'Parent Portal',
  robots: { index: false, follow: false },
}

const NAV: PortalNavItem[] = [
  { label: 'Overview', href: '/parent', icon: 'overview' },
  { label: 'Reports', href: '/parent/reports', icon: 'reports' },
]

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const record = await getParentRecord()

  return (
    <PortalShell
      title="Parent Portal"
      subtitle={`${record.parentName} · ${record.children.length} student${
        record.children.length === 1 ? '' : 's'
      }`}
      nav={NAV}
    >
      {children}
    </PortalShell>
  )
}
