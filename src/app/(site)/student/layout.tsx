import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { StudentPortalLayout } from '@/components/portal/StudentPortalLayout'
import { getViewer } from '@/lib/portal/auth'
import { getMyStudentRecord } from '@/lib/portal/records'

// Personal records: always rendered per request, never prerendered or cached.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Student Dashboard',
  robots: { index: false, follow: false },
}

/**
 * The authenticated student portal. middleware.ts has already refused anyone
 * who is not an approved student before this runs; this is the second,
 * independent check, so the portal still cannot render if middleware ever
 * fails to. The public sample lives at /preview/student.
 *
 * Records are read with the student's own session, so row-level security
 * decides what comes back (lib/portal/records.ts).
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer()
  if (viewer?.kind !== 'student') redirect('/login/student')

  // A failed load leaves the frame with just the name; the page's error
  // boundary explains, so the header never shows an invented programme.
  const profile = await getMyStudentRecord()
    .then((record) => record?.profile ?? null)
    .catch(() => null)

  return (
    <StudentPortalLayout base="/student" name={viewer.name || 'Student'} profile={profile}>
      {children}
    </StudentPortalLayout>
  )
}
