/**
 * Shown on every admin screen while the area is unprotected.
 *
 * It states the real situation rather than implying privacy the hosting
 * cannot provide. Remove it once `IS_ADMIN_AUTH_ENABLED` is true and the data
 * is served from behind a real session.
 */
export function AccessNotice() {
  return (
    <div className="rounded-card border border-alert-200 bg-alert-50/70 px-4 py-3.5 sm:px-5">
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-alert-500" aria-hidden="true">
          <path
            d="M8 5v4m0 2.5h.01M8 1.5 14.5 13.5h-13L8 1.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-alert-800">
            Not protected yet — anyone with this URL can open it
          </p>
          <p className="mt-1 text-sm leading-relaxed text-alert-800/90">
            The site is a static export, so there is no server to check a login. This area is kept
            out of the navigation, out of search engines and out of <code>robots.txt</code>, but
            that hides it rather than secures it. Real protection needs a server and a database —
            see <code>docs/ADMIN.md</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
