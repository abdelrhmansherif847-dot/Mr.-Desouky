import { getOwnerSession } from '@/lib/admin/auth'

/**
 * Who is signed in, and the way out. Rendered from the verified session, so
 * it shows a name only when the server has actually confirmed one.
 */
export async function OwnerBar() {
  const owner = await getOwnerSession()
  if (!owner) return null

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-deep-500 sm:inline">
        Signed in as <span className="font-semibold text-deep-700">{owner.email}</span>
      </span>
      <form action="/admin/signout" method="post">
        <button
          type="submit"
          className="rounded-lg border border-deep-100 px-3 py-1.5 text-sm font-medium text-deep-600 transition-colors duration-200 hover:bg-deep-50 hover:text-deep-800"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
