import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { AccessNotice } from '@/components/admin/AccessNotice'
import { OwnerBar } from '@/components/admin/OwnerBar'
import { AccountLine, Empty, Metric, RoleBadge, Section, StatusBadge, formatDateTime } from '@/components/admin/ui'
import { getDashboard } from '@/lib/admin/data'

/**
 * The owner's morning view: what is waiting for a decision, how many are
 * active, what is coming this week, and what changed most recently.
 */
export default async function AdminOverviewPage() {
  const d = await getDashboard()

  return (
    <AdminShell title="Overview" subtitle="What needs a decision, and what changed." actions={<OwnerBar />}>
      <div className="space-y-6">
        <AccessNotice />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Metric
            label="Waiting for approval"
            value={d.pending}
            hint={d.pending ? 'Review and approve' : 'Nobody waiting'}
            href="/admin/approvals"
            tone={d.pending ? 'sky' : 'neutral'}
          />
          <Metric label="Active students" value={d.activeStudents} href="/admin/students" />
          <Metric label="Active parents" value={d.activeParents} href="/admin/parents" />
          <Metric label="Sessions next 7 days" value={d.upcomingSessions} hint="Scheduled" />
          <Metric
            label="Homework to review"
            value={d.homeworkToReview}
            hint="Past due, still marked assigned"
            tone={d.homeworkToReview ? 'alert' : 'neutral'}
          />
        </div>

        {d.staleSessions ? (
          <p className="rounded-card border border-olive-200 bg-olive-50/70 px-4 py-3 text-sm text-olive-900">
            {d.staleSessions} past session{d.staleSessions === 1 ? ' is' : 's are'} still marked scheduled. Mark
            them attended, missed or cancelled from each student&rsquo;s page so attendance stays accurate.
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Section
            title="Newest accounts"
            description="Most recent sign-ups first"
            action={
              <Link href="/admin/users" className="py-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
                All users
              </Link>
            }
          >
            {d.recentAccounts.length ? (
              <ul className="divide-y divide-deep-100">
                {d.recentAccounts.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <AccountLine account={a} href={a.role === 'student' ? `/admin/students/${a.id}` : undefined} />
                    <div className="flex flex-wrap items-center gap-2">
                      <RoleBadge role={a.role} />
                      <StatusBadge status={a.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No accounts yet.</Empty>
            )}
          </Section>

          <Section title="Recent activity" description="Latest records added or changed">
            {d.recentActivity.length ? (
              <ul className="divide-y divide-deep-100">
                {d.recentActivity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-0.5 w-20 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
                      {item.what}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link href={item.href} className="break-words text-sm font-medium text-deep-700 hover:text-sky-700">
                        {item.detail}
                      </Link>
                      <p className="mt-0.5 text-xs text-deep-400">{formatDateTime(item.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Nothing recorded yet. Records appear here as you add them on a student&rsquo;s page.</Empty>
            )}
          </Section>
        </div>
      </div>
    </AdminShell>
  )
}
