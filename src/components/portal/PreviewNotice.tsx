import Link from 'next/link'

/**
 * Shown on every portal screen while the portals run on sample data.
 * Remove this component once `IS_SAMPLE_DATA` is false and real records load.
 */
export function PreviewNotice({ audience }: { audience: 'student' | 'parent' }) {
  return (
    <div className="rounded-card border border-olive-200 bg-olive-50/70 px-4 py-3.5 sm:px-5">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-500 px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
          Preview
        </span>
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-olive-900">
          This is a design preview of the {audience} portal, showing{' '}
          <strong className="font-semibold">sample data for a fictional student</strong>. Live
          records, logins and real progress will appear here once the portal is connected.{' '}
          <Link href="/contact" className="link-underline font-semibold">
            Ask about access
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
