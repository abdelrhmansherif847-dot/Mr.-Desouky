import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { LinkForm, UnlinkButton } from '@/components/admin/forms'
import { OwnerBar } from '@/components/admin/OwnerBar'
import { AccountLine, Empty, StatusBadge } from '@/components/admin/ui'
import { getParents, getStudents } from '@/lib/admin/data'

/**
 * Parents and the students they are linked to. A link is what lets a parent
 * see a child's records; making one is a statement that you have confirmed
 * this adult is the student's parent or guardian.
 */
export default async function AdminParentsPage() {
  const [parents, students] = await Promise.all([getParents(), getStudents()])

  return (
    <AdminShell
      title="Parents"
      subtitle="Link each parent to their children. A parent sees only linked students."
      actions={<OwnerBar />}
    >
      {parents.length ? (
        <ul className="space-y-3">
          {parents.map((p) => {
            const linked = new Set(p.children.map((c) => c.id))
            const choices = students
              .filter((s) => !linked.has(s.id) && s.status !== 'suspended')
              .map((s) => ({ value: s.id, label: `${s.name || s.email}${s.status === 'pending' ? ' (pending)' : ''}` }))
            return (
              <li key={p.id} className="rounded-card border border-deep-100 bg-white p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <AccountLine account={p} />
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">
                        Linked students ({p.children.length})
                      </p>
                      {p.children.length ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {p.children.map((c) => (
                            <li key={c.id} className="inline-flex items-center gap-1 rounded-full bg-mist py-1 pl-3 pr-1 ring-1 ring-inset ring-deep-100">
                              <Link href={`/admin/students/${c.id}`} className="text-sm font-medium text-deep-700 hover:text-sky-700">
                                {c.name}
                              </Link>
                              <UnlinkButton parent={p.id} student={c.id} label={`Unlink ${c.name}`} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-deep-400">Not linked yet — this parent sees the waiting screen.</p>
                      )}
                    </div>
                    <LinkForm fixed="parent" fixedId={p.id} choices={choices} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <Empty>No parent accounts yet.</Empty>
      )}
    </AdminShell>
  )
}
