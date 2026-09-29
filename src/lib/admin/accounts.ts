import type { AccountStatus } from './forms'

export type { AccountStatus }

/** An account as the owner's console shows it. Pure — no server imports. */
export type Role = 'owner' | 'assistant' | 'student' | 'parent'

export type Account = {
  id: string
  email: string
  name: string
  phone: string | null
  role: Role
  status: AccountStatus
  createdAt: string
}

export type AccountFilter = { q?: string; role?: string; status?: string }

/**
 * Filtering happens here, in plain code, rather than by building a query
 * string from what was typed — so a search box can never become a filter
 * expression.
 */
export function filterAccounts(accounts: Account[], filter: AccountFilter): Account[] {
  const q = (filter.q ?? '').trim().toLowerCase().slice(0, 80)
  return accounts.filter(
    (a) =>
      (!filter.role || a.role === filter.role) &&
      (!filter.status || a.status === filter.status) &&
      (!q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone ?? '').replace(/\s+/g, '').includes(q.replace(/\s+/g, ''))),
  )
}
