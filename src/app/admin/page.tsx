import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { AccessNotice } from '@/components/admin/AccessNotice'
import { OwnerBar } from '@/components/admin/OwnerBar'
import { ArrowRight } from '@/components/ui/Button'

/**
 * A deliberately small landing page.
 *
 * The admin area is a foundation for a later phase, not a product being built
 * now — so it holds the one tool that exists and nothing speculative. New
 * tools get added here when they are actually built.
 */
export default function AdminOverviewPage() {
  return (
    <AdminShell
      title="Admin"
      subtitle="Internal tools. Separate from the public website."
      actions={<OwnerBar />}
    >
      <div className="space-y-6">
        <AccessNotice />

        <Link
          href="/admin/schedule"
          className="group flex max-w-md flex-col rounded-card border border-deep-100 bg-white p-5 transition-[transform,box-shadow,border-color] duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-card motion-reduce:hover:translate-y-0"
        >
          <h2 className="font-display text-lg font-bold text-deep-700 group-hover:text-sky-600">
            Weekly schedule
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-deep-500">
            The teaching week — sessions, breaks and open slots across the four days.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600">
            Open
            <ArrowRight />
          </span>
        </Link>

        <p className="max-w-2xl text-sm leading-relaxed text-deep-400">
          Student records, attendance and payments come later, on a host with a server and a
          database. The structure for that is described in{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-deep-600">
            docs/ADMIN.md
          </code>
          .
        </p>
      </div>
    </AdminShell>
  )
}
