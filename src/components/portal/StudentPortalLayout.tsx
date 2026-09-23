import { PortalShell, type PortalNavItem } from '@/components/portal/PortalShell'
import { Badge } from '@/components/ui/Card'
import { getStudentRecord } from '@/lib/portal/data'
import type { StudentBase } from './base'

/**
 * The student portal's frame — header, identity and navigation — shared by the
 * authenticated portal and the public preview. Only the base path differs, so
 * the two can never drift apart visually.
 */
export async function StudentPortalLayout({
  base,
  children,
}: {
  base: StudentBase
  children: React.ReactNode
}) {
  const record = await getStudentRecord()

  const nav: PortalNavItem[] = [
    { label: 'Overview', href: base, icon: 'overview' },
    { label: 'My Journey', href: `${base}/journey`, icon: 'journey' },
    { label: 'Sessions', href: `${base}/sessions`, icon: 'sessions' },
    { label: 'Homework', href: `${base}/homework`, icon: 'homework' },
    { label: 'Quizzes & Reviews', href: `${base}/quizzes`, icon: 'quizzes' },
    { label: 'Mock Exams', href: `${base}/mocks`, icon: 'mocks' },
  ]

  return (
    <PortalShell
      title={record.profile.name}
      subtitle={`${record.profile.programTitle} · started ${new Date(
        `${record.profile.startedOn}T00:00:00Z`,
      ).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`}
      nav={nav}
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={record.profile.exam === 'SAT' ? 'sky' : 'olive'}>{record.profile.exam}</Badge>
          <Badge tone="neutral">{record.profile.level}</Badge>
        </div>
      }
    >
      {children}
    </PortalShell>
  )
}
