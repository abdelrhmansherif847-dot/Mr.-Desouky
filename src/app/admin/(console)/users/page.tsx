import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { AccountActions } from '@/components/admin/forms'
import { OwnerBar } from '@/components/admin/OwnerBar'
import { AccountLine, Empty, RoleBadge, StatusBadge, formatDateTime } from '@/components/admin/ui'
import { filterAccounts, getAccounts } from '@/lib/admin/data'

const ROLES = ['student', 'parent', 'owner', 'assistant'] as const
const STATUSES = ['pending', 'approved', 'suspended'] as const

const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined)

/**
 * Every account, searchable by name, email or phone and filterable by role
 * and status. The filter is a plain GET form, so a filtered view is a URL
 * the owner can bookmark; the values are only ever compared, never built
 * into a query.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const q = one(params.q)?.slice(0, 80) ?? ''
  const role = ROLES.find((r) => r === one(params.role))
  const status = STATUSES.find((s) => s === one(params.status))
  const all = await getAccounts()
  const shown = filterAccounts(all, { q, role, status })

  const selectCls =
    'block w-full rounded-lg border border-deep-200 bg-white px-3 py-2 text-sm text-deep-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100'

  return (
    <AdminShell title="Users" subtitle={`${all.length} account${all.length === 1 ? '' : 's'}`} actions={<OwnerBar />}>
      <div className="space-y-5">
        <form role="search" className="grid gap-3 rounded-panel border border-deep-100 bg-white p-4 sm:grid-cols-[1fr_10rem_10rem_auto] sm:items-end sm:p-5">
          <div>
            <label htmlFor="users-q" className="mb-1 block text-xs font-semibold text-deep-600">
              Search
            </label>
            <input id="users-q" name="q" type="search" defaultValue={q} placeholder="Name, email or phone" maxLength={80} className={selectCls} />
          </div>
          <div>
            <label htmlFor="users-role" className="mb-1 block text-xs font-semibold text-deep-600">
              Role
            </label>
            <select id="users-role" name="role" defaultValue={role ?? ''} className={selectCls}>
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r[0].toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="users-status" className="mb-1 block text-xs font-semibold text-deep-600">
              Status
            </label>
            <select id="users-status" name="status" defaultValue={status ?? ''} className={selectCls}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="min-h-[2.5rem] rounded-full bg-sky-500 px-5 py-2 font-display text-sm font-semibold text-white hover:bg-sky-600">
              Filter
            </button>
            {q || role || status ? (
              <Link href="/admin/users" className="py-2 text-sm font-semibold text-deep-500 hover:text-deep-700">
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        <p className="text-sm text-deep-500" role="status">
          {shown.length === all.length ? `Showing all ${all.length}` : `${shown.length} of ${all.length} match`}
        </p>

        {shown.length ? (
          <ul className="divide-y divide-deep-100 overflow-hidden rounded-panel border border-deep-100 bg-white">
            {shown.map((a) => (
              <li key={a.id} className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.3fr)] lg:items-center">
                <AccountLine account={a} href={a.role === 'student' ? `/admin/students/${a.id}` : undefined} />
                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge role={a.role} />
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-deep-400">Joined {formatDateTime(a.createdAt)}</span>
                </div>
                <div className="lg:justify-self-end">
                  {a.role === 'owner' ? (
                    <span className="text-xs text-deep-400">Owner account</span>
                  ) : (
                    <AccountActions target={a.id} status={a.status} role={a.role} name={a.name || a.email} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No accounts match. Try a shorter search or clear the filters.</Empty>
        )}
      </div>
    </AdminShell>
  )
}
