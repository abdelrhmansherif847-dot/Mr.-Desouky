import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ParentPortalLayout } from '@/components/portal/ParentPortalLayout'
import { getViewer } from '@/lib/portal/auth'
import { getMyChildren } from '@/lib/portal/records'

// Personal records: always rendered per request, never prerendered or cached.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Parent Portal',
  robots: { index: false, follow: false },
}

/** The authenticated parent portal. See the student layout for the reasoning. */
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  if (viewer?.kind !== 'parent') redirect('/login/parent')

  // A failed load leaves the count out; the page's error boundary explains.
  const childCount = await getMyChildren()
    .then((children) => children.length)
    .catch(() => null)

  return (
    <ParentPortalLayout base="/parent" parentName={viewer.name || 'Parent'} childCount={childCount}>
      {children}
    </ParentPortalLayout>
  )
}
