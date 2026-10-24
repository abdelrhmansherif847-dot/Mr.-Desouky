import { requireOwner } from '@/lib/admin/data'

// Owner-only data: rendered per request, never prerendered or cached.
export const dynamic = 'force-dynamic'

/**
 * Every admin screen except sign-in. middleware.ts has already answered 404
 * to anyone who is not the owner; this is the second, independent check, so
 * the console cannot render even if middleware does not run. Each server
 * action checks again, and the database's policies check last.
 */
export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  await requireOwner()
  return children
}
