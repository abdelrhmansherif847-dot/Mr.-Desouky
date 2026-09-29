import { AdminShell } from '@/components/admin/AdminShell'
import { AccountActions } from '@/components/admin/forms'
import { OwnerBar } from '@/components/admin/OwnerBar'
import { AccountLine, Empty, RoleBadge, Section, formatDateTime } from '@/components/admin/ui'
import { getAccounts } from '@/lib/admin/data'

/**
 * New accounts wait here until the owner decides. Approving grants the portal
 * for the role shown; if someone signed up with the wrong role, correct it
 * first. Suspended accounts are listed below, ready to be reinstated.
 */
export default async function AdminApprovalsPage() {
  const accounts = await getAccounts()
  const pending = accounts.filter((a) => a.status === 'pending').reverse()
  const suspended = accounts.filter((a) => a.status === 'suspended')

  return (
    <AdminShell title="Approvals" subtitle="New accounts have no access until you approve them." actions={<OwnerBar />}>
      <div className="space-y-6">
        <Section
          id="pending"
          title={`Waiting for approval (${pending.length})`}
          description="Oldest first. Check the name and role against who you expect before approving."
        >
          {pending.length ? (
            <ul className="divide-y divide-deep-100">
              {pending.map((a) => (
                <li key={a.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="flex flex-wrap items-start gap-3">
                    <AccountLine account={a} />
                    <div className="flex items-center gap-2">
                      <RoleBadge role={a.role} />
                      <span className="text-xs text-deep-400">Signed up {formatDateTime(a.createdAt)}</span>
                    </div>
                  </div>
                  <AccountActions target={a.id} status={a.status} role={a.role} name={a.name || a.email} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nobody is waiting. New sign-ups appear here.</Empty>
          )}
        </Section>

        <Section id="suspended" title={`Suspended (${suspended.length})`} description="No portal access until reinstated.">
          {suspended.length ? (
            <ul className="divide-y divide-deep-100">
              {suspended.map((a) => (
                <li key={a.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="flex flex-wrap items-start gap-3">
                    <AccountLine account={a} />
                    <RoleBadge role={a.role} />
                  </div>
                  <AccountActions target={a.id} status={a.status} role={a.role} name={a.name || a.email} compact />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No suspended accounts.</Empty>
          )}
        </Section>
      </div>
    </AdminShell>
  )
}
