import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { OwnerBar } from '@/components/admin/OwnerBar'
import { Empty, StatusBadge } from '@/components/admin/ui'
import { getStudents } from '@/lib/admin/data'
import { JOURNEY_STAGES } from '@/content/journey'
import { formatLongDate } from '@/lib/utils'

/** Every student account, with where they are and what is next. */
export default async function AdminStudentsPage() {
  const students = await getStudents()
  const order = { approved: 0, pending: 1, suspended: 2 } as const
  students.sort((a, b) => order[a.status] - order[b.status] || (a.name || a.email).localeCompare(b.name || b.email))

  return (
    <AdminShell title="Students" subtitle="Open a student to record sessions, homework, results and feedback." actions={<OwnerBar />}>
      {students.length ? (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {students.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/students/${s.id}`}
                className="flex h-full flex-col rounded-card border border-deep-100 bg-white p-4 transition-colors duration-200 hover:border-sky-200 hover:bg-sky-50/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-display text-base font-bold text-deep-700">{s.name || 'No name given'}</p>
                    <p className="mt-0.5 break-all text-xs text-deep-500">{s.email}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">Programme</dt>
                    <dd className="mt-1 text-deep-600">
                      {s.configured
                        ? `${s.exam ?? '—'} · ${s.stage !== null ? JOURNEY_STAGES[s.stage]?.title : '—'}`
                        : 'Not set up'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">Next session</dt>
                    <dd className="mt-1 text-deep-600">{s.nextSession ? formatLongDate(s.nextSession) : 'None scheduled'}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">Parents linked</dt>
                    <dd className="mt-1 text-deep-600">{s.parents}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No student accounts yet. They appear here once someone signs up as a student.</Empty>
      )}
    </AdminShell>
  )
}
