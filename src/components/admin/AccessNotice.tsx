import { IS_ADMIN_AUTH_ENABLED, IS_ADMIN_DATA_PRIVATE } from '@/lib/admin/auth'

/**
 * States what is actually protecting this screen right now, so the answer is
 * never guessed from how private the page happens to look.
 */
export function AccessNotice() {
  if (!IS_ADMIN_AUTH_ENABLED) {
    return (
      <Notice tone="alert" title="No authentication project configured for this build">
        Without <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> the guard cannot verify anyone, so it refuses
        every request rather than failing open. On the static Pages build these routes are not
        published at all. See <code>docs/ADMIN.md</code>.
      </Notice>
    )
  }

  if (!IS_ADMIN_DATA_PRIVATE) {
    return (
      <Notice tone="olive" title="Access is enforced — the data is not private yet">
        Reaching this page required a verified session and a profile with role{' '}
        <code>owner</code>. The schedule below is still the anonymised file committed to the
        repository, not live records. Real student data moves into Postgres behind row-level
        security before anything identifying is entered.
      </Notice>
    )
  }

  return null
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: 'alert' | 'olive'
  title: string
  children: React.ReactNode
}) {
  const alert = tone === 'alert'
  return (
    <div
      className={
        alert
          ? 'rounded-card border border-alert-200 bg-alert-50/70 px-4 py-3.5 sm:px-5'
          : 'rounded-card border border-olive-200 bg-olive-50/70 px-4 py-3.5 sm:px-5'
      }
    >
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 16 16"
          className={`mt-0.5 h-4 w-4 shrink-0 ${alert ? 'text-alert-500' : 'text-olive-600'}`}
          aria-hidden="true"
        >
          {alert ? (
            <path
              d="M8 5v4m0 2.5h.01M8 1.5 14.5 13.5h-13L8 1.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M3.5 8.5 6.5 11.5 12.5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        <div className="min-w-0">
          <p
            className={`font-display text-sm font-bold ${alert ? 'text-alert-800' : 'text-olive-800'}`}
          >
            {title}
          </p>
          <p
            className={`mt-1 text-sm leading-relaxed ${alert ? 'text-alert-800/90' : 'text-olive-800/90'}`}
          >
            {children}
          </p>
        </div>
      </div>
    </div>
  )
}
