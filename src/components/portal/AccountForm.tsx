'use client'

import Link from 'next/link'
import { LogoMark } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

/**
 * The plain frame shared by the account screens: create an account, reset a
 * password, set a new one. Deliberately the same card as the account notices,
 * so these read as one family. The full visual treatment is later work; this
 * is the working flow.
 */
export function AccountFormShell({
  eyebrow,
  title,
  lead,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  lead?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <section className="bg-mist">
      <div className="container-page flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-panel border border-deep-100 bg-white p-7 shadow-card sm:p-9">
          <LogoMark size="md" />
          <p className="eyebrow mt-6 text-sky-600">{eyebrow}</p>
          <h1 className="mt-2 font-display text-xl font-bold text-deep-700">{title}</h1>
          {lead ? <div className="mt-3 text-sm leading-relaxed text-deep-600">{lead}</div> : null}
          <div className="mt-6">{children}</div>
          {footer ? (
            <div className="mt-7 border-t border-deep-100 pt-5 text-sm text-deep-500">{footer}</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function Field({
  id,
  label,
  invalid,
  describedBy,
  hint,
  ...input
}: {
  id: string
  label: string
  invalid?: boolean
  describedBy?: string
  hint?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className="mt-4 first:mt-0">
      <label htmlFor={id} className="block text-sm font-semibold text-deep-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={[hintId, invalid ? describedBy : undefined].filter(Boolean).join(' ') || undefined}
        className={cn(
          'mt-2 w-full rounded-card border bg-white px-4 py-3 text-[0.95rem] text-deep-700',
          'outline-none transition-[border-color,box-shadow] duration-200 ease-smooth',
          'placeholder:text-deep-400 disabled:cursor-not-allowed disabled:bg-deep-50',
          invalid
            ? 'border-alert-300 focus:border-alert-500 focus:ring-4 focus:ring-alert-100'
            : 'border-deep-200 hover:border-deep-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100',
        )}
        {...input}
      />
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-deep-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function FormError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-4 break-words text-sm text-alert-600">
      {message}
    </p>
  )
}

export function NotConfigured() {
  return (
    <p className="rounded-card border border-alert-200 bg-alert-50/70 px-4 py-3 text-sm leading-relaxed text-alert-800">
      Accounts are not configured for this deployment.
    </p>
  )
}

export function Done({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="status">
      <p className="font-display text-base font-bold text-deep-700">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-deep-600">{children}</div>
    </div>
  )
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-underline font-semibold text-sky-600">
      {children}
    </Link>
  )
}
