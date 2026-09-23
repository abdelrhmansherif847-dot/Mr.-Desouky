import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { StudentPortalLayout } from '@/components/portal/StudentPortalLayout'
import { getViewer } from '@/lib/portal/auth'

export const metadata: Metadata = {
  title: 'Student Dashboard',
  robots: { index: false, follow: false },
}

/**
 * The authenticated student portal. middleware.ts has already refused anyone
 * who is not an approved student before this runs; this is the second,
 * independent check, so the portal still cannot render if middleware ever
 * fails to. The public sample lives at /preview/student.
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  if (viewer?.kind !== 'student') redirect('/login/student')

  return <StudentPortalLayout base="/student">{children}</StudentPortalLayout>
}
