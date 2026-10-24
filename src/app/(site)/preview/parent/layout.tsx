import type { Metadata } from 'next'
import { ParentPortalLayout } from '@/components/portal/ParentPortalLayout'
import { getSampleParentRecord } from '@/lib/portal/data'

export const metadata: Metadata = {
  title: 'Parent Portal — Sample Preview',
  robots: { index: false, follow: false },
}

/** The public sample of the parent portal. See the student preview layout. */
export default async function ParentPreviewLayout({ children }: { children: React.ReactNode }) {
  const sample = await getSampleParentRecord()
  return (
    <ParentPortalLayout base="/preview/parent" parentName={sample.parentName} childCount={sample.children.length}>
      {children}
    </ParentPortalLayout>
  )
}
