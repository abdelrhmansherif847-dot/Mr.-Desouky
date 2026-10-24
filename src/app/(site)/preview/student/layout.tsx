import type { Metadata } from 'next'
import { StudentPortalLayout } from '@/components/portal/StudentPortalLayout'
import { getSampleStudentRecord } from '@/lib/portal/data'

export const metadata: Metadata = {
  title: 'Student Portal — Sample Preview',
  robots: { index: false, follow: false },
}

/**
 * The public sample of the student portal. Anyone may browse it; it renders
 * only the fictional sample record, reads no session and queries nothing, and
 * every screen carries the preview notice. It is static, so it also survives
 * on the GitHub Pages export, where the real portal is stripped.
 */
export default async function StudentPreviewLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getSampleStudentRecord()
  return (
    <StudentPortalLayout base="/preview/student" name={profile.name} profile={profile}>
      {children}
    </StudentPortalLayout>
  )
}
