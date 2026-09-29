import Link from 'next/link'
import type { Account } from '@/lib/admin/data'
import { cn } from '@/lib/utils'

/** Shared pieces of the owner's console: dense, calm, and consistent. */

const STATUS_CLS = {
  pending: 'bg-sky-50 text-sky-700 ring-sky-200/70',
  approved: 'bg-growth-50 text-growth-700 ring-growth-200/70',
  suspended: 'bg-alert-50 text-alert-700 ring-alert-200/70',
} as const

export function StatusBadge({ status }: { status: Account['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] ring-1 ring-inset',
        STATUS_CLS[status],
      )}
    >
      {status}
    </span>
  )
}

export function RoleBadge({ role }: { role: Account['role'] }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-mist px-2.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-deep-600 ring-1 ring-inset ring-deep-200/60">
      {role}
    </span>
  )
}

export function Metric({
  label,
  value,
  hint,
  href,
  tone = 'neutral',
}: {
  label: string
  value: number
  hint?: string
  href?: string
  tone?: 'neutral' | 'sky' | 'alert'
}) {
  const body = (
    <>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">{label}</p>
      <p
        className={cn(
          'mt-2 font-display text-3xl font-bold tabular-nums',
          tone === 'alert' ? 'text-alert-600' : tone === 'sky' ? 'text-sky-600' : 'text-deep-700',
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-deep-400">{hint}</p> : null}
    </>
  )
  const cls = 'block rounded-card border border-deep-100 bg-white p-4 sm:p-5'
  return href ? (
    <Link
      href={href}
      className={cn(cls, 'transition-colors duration-200 hover:border-sky-200 hover:bg-sky-50/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500')}
    >
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export function Section({
  title,
  description,
  action,
  children,
  id,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  id?: string
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="rounded-panel border border-deep-100 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-deep-100 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 id={id ? `${id}-title` : undefined} className="font-display text-base font-bold text-deep-700">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-xs text-deep-400">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-deep-200 px-4 py-6 text-center text-sm text-deep-400">
      {children}
    </p>
  )
}

export function AccountLine({ account, href }: { account: Account; href?: string }) {
  const name = account.name || 'No name given'
  return (
    <div className="min-w-0">
      {href ? (
        <Link href={href} className="break-words font-display text-sm font-bold text-deep-700 hover:text-sky-700">
          {name}
        </Link>
      ) : (
        <p className="break-words font-display text-sm font-bold text-deep-700">{name}</p>
      )}
      <p className="mt-0.5 break-all text-xs text-deep-500">{account.email}</p>
      {account.phone ? <p className="mt-0.5 text-xs text-deep-400">{account.phone}</p> : null}
    </div>
  )
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Cairo',
  })
}
