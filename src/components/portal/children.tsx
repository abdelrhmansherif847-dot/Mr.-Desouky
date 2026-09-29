import Link from 'next/link'
import { EmptyPanel } from '@/components/portal/widgets'
import { ArrowRight } from '@/components/ui/Button'
import type { ParentBase } from '@/components/portal/base'
import type { ChildSummary } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

/**
 * Choosing which child a parent is looking at.
 *
 * The chosen child travels in the URL as `?child=<id>`. That is a selection,
 * not a permission: the server resolves it against the parent's own links
 * (lib/portal/records.ts → getChildView) and the database's row-level
 * security decides what any query returns. An id that is not one of this
 * parent's children is simply ignored.
 */

export type ParentSection = '' | 'reports'

export function childHref(base: ParentBase, section: ParentSection, id: string): string {
  return `${base}${section ? `/${section}` : ''}/?child=${encodeURIComponent(id)}`
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '•'
  )
}

/** No child linked yet — the account works, the link is made by Mr. Desouky. */
export function WaitingForLink() {
  return (
    <EmptyPanel
      title="Waiting for your student link"
      icon="M9 15l6-6m-4.5-2.5 1.1-1.1a4 4 0 0 1 5.66 5.66l-1.1 1.1m-4.32 4.32-1.1 1.1a4 4 0 0 1-5.66-5.66l1.1-1.1"
    >
      <p>
        Your account is approved. Mr. Desouky links it to your child&rsquo;s account once he has confirmed
        you are their parent or guardian — then their sessions, homework, results and feedback appear
        here.
      </p>
      <p className="mt-3">
        Already enrolled and still seeing this?{' '}
        <Link href="/contact" className="link-underline font-semibold text-sky-700">
          Send a message
        </Link>
        .
      </p>
    </EmptyPanel>
  )
}

/** Two or more children and none chosen yet. */
export function ChildChooser({
  base,
  section,
  items,
}: {
  base: ParentBase
  section: ParentSection
  items: ChildSummary[]
}) {
  return (
    <section aria-labelledby="child-chooser-title" className="rounded-panel border border-deep-100 bg-white p-5 sm:p-6 lg:p-8">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
        {items.length} linked students
      </p>
      <h2 id="child-chooser-title" className="mt-1.5 font-display text-xl font-bold text-deep-700">
        Whose progress would you like to see?
      </h2>
      <p className="mt-1 text-sm text-deep-500">You can switch at any time from the top of the page.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((child) => (
          <li key={child.id}>
            <Link
              href={childHref(base, section, child.id)}
              className="group flex items-center gap-4 rounded-card border border-deep-100 bg-mist/60 p-4 transition-colors duration-200 hover:border-sky-200 hover:bg-sky-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-deep-600 font-display text-sm font-bold text-white"
              >
                {initials(child.name)}
              </span>
              <span className="min-w-0 flex-1 break-words font-display text-base font-bold text-deep-700">
                {child.name}
              </span>
              <ArrowRight className="text-sky-600" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Shown above a child's view when the parent has more than one child. */
export function ChildSwitcher({
  base,
  section,
  items,
  selectedId,
}: {
  base: ParentBase
  section: ParentSection
  items: ChildSummary[]
  selectedId: string
}) {
  if (items.length < 2) return null
  return (
    <nav aria-label="Choose a student" className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">Viewing</span>
      {items.map((child) => {
        const current = child.id === selectedId
        return (
          <Link
            key={child.id}
            href={childHref(base, section, child.id)}
            aria-current={current ? 'true' : undefined}
            className={cn(
              'inline-flex min-h-[2.25rem] items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-inset transition-colors duration-200',
              current
                ? 'bg-deep-600 text-white ring-deep-600'
                : 'bg-white text-deep-600 ring-deep-200 hover:bg-mist hover:ring-deep-300',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-bold',
                current ? 'bg-white/20' : 'bg-deep-50 text-deep-500',
              )}
            >
              {initials(child.name)}
            </span>
            {child.name}
          </Link>
        )
      })}
    </nav>
  )
}
