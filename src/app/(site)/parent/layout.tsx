import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ParentPortalLayout } from '@/components/portal/ParentPortalLayout'
import { getViewer } from '@/lib/portal/auth'

export const metadata: Metadata = {
  title: 'Parent Portal',
  robots: { index: false, follow: false },
}

/** The authenticated parent portal. See the student layout for the reasoning. */
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  if (viewer?.kind !== 'parent') redirect('/login/parent')

  return <ParentPortalLayout base="/parent">{children}</ParentPortalLayout>
}
