import type { Metadata } from 'next'
import { PortalShell, type PortalNavItem } from '@/components/portal/PortalShell'
import { getStudentRecord } from '@/lib/portal/data'
import { Badge } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Student Dashboard',
  robots: { index: false, follow: false },
}

const NAV: PortalNavItem[] = [
  { label: 'Overview', href: '/student', icon: 'overview' },
  { label: 'My Journey', href: '/student/journey', icon: 'journey' },
  { label: 'Sessions', href: '/student/sessions', icon: 'sessions' },
  { label: 'Homework', href: '/student/homework', icon: 'homework' },
  { label: 'Quizzes & Reviews', href: '/student/quizzes', icon: 'quizzes' },
  { label: 'Mock Exams', href: '/student/mocks', icon: 'mocks' },
]

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const record = await getStudentRecord()

  return (
    <PortalShell
      title={record.profile.name}
      subtitle={`${record.profile.programTitle} · started ${new Date(
        `${record.profile.startedOn}T00:00:00Z`,
      ).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`}
      nav={NAV}
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
