import { PortalShell, type PortalNavItem } from '@/components/portal/PortalShell'
import { Badge } from '@/components/ui/Card'
import type { StudentProfile } from '@/lib/portal/types'
import type { StudentBase } from './base'

/**
 * The student portal's frame — header, identity and navigation — shared by the
 * authenticated portal and the public preview. Only the base path and the
 * profile differ, so the two can never drift apart visually.
 *
 * `profile` is null when the record could not be loaded; the frame still
 * renders with the student's name and the page explains the problem.
 */
export function StudentPortalLayout({
  base,
  name,
  profile,
  children,
}: {
  base: StudentBase
  name: string
  profile: StudentProfile | null
  children: React.ReactNode
}) {
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
      title={name}
      subtitle={subtitleFor(profile)}
      nav={nav}
      meta={
        profile?.exam || profile?.level ? (
          <div className="flex flex-wrap items-center gap-2">
            {profile.exam ? <Badge tone={profile.exam === 'SAT' ? 'sky' : 'olive'}>{profile.exam}</Badge> : null}
            {profile.level ? <Badge tone="neutral">{profile.level}</Badge> : null}
          </div>
        ) : undefined
      }
    >
      {children}
    </PortalShell>
  )
}

function subtitleFor(profile: StudentProfile | null): string {
  if (!profile) return 'Student portal'
  if (!profile.configured) return 'Your programme is being set up'
  const started = profile.startedOn
    ? `started ${new Date(`${profile.startedOn}T00:00:00Z`).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })}`
    : null
  return [profile.programTitle ?? 'Your programme', started].filter(Boolean).join(' · ')
}
