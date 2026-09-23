import type { Metadata } from 'next'
import { ParentPortalLayout } from '@/components/portal/ParentPortalLayout'

export const metadata: Metadata = {
  title: 'Parent Portal — Sample Preview',
  robots: { index: false, follow: false },
}

/** The public sample of the parent portal. See the student preview layout. */
export default function ParentPreviewLayout({ children }: { children: React.ReactNode }) {
  return <ParentPortalLayout base="/preview/parent">{children}</ParentPortalLayout>
}
