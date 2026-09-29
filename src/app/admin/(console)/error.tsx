'use client'

import Link from 'next/link'

/** A load failure in the console. The cause is in the server log, not here. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-mist px-5">
      <section role="alert" className="max-w-md rounded-panel border border-deep-100 bg-white p-8 text-center">
        <h1 className="font-display text-lg font-bold text-deep-700">This page could not load</h1>
        <p className="mt-2 text-sm leading-relaxed text-deep-500">
          Nothing was changed. It is usually a brief connection problem — try again.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-sky-500 px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-sky-600"
          >
            Try again
          </button>
          <Link href="/admin" className="text-sm font-semibold text-sky-700">
            Admin overview
          </Link>
        </div>
      </section>
    </div>
  )
}
