import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardProps = {
  children: ReactNode
  className?: string
  /** Adds hover lift — only for cards that are actually clickable. */
  interactive?: boolean
  tone?: 'paper' | 'mist' | 'deep' | 'outline'
}

const tones = {
  paper: 'bg-white border-deep-100',
  mist: 'bg-mist border-deep-100',
  deep: 'bg-deep-800 border-white/10 text-deep-100',
  outline: 'bg-transparent border-deep-200',
}

export function Card({ children, className, interactive, tone = 'paper' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border shadow-card transition-all duration-300 ease-calm',
        tones[tone],
        interactive && 'hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  )
}

type CardLinkProps = CardProps & { href: string }

export function CardLink({ href, children, className, tone = 'paper' }: CardLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-card border shadow-card transition-all duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-lift',
        tones[tone],
        className,
      )}
    >
      {children}
    </Link>
  )
}

type BadgeProps = {
  children: ReactNode
  tone?: 'sky' | 'deep' | 'growth' | 'olive' | 'alert' | 'neutral'
  className?: string
}

const badgeTones = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-200/70',
  deep: 'bg-deep-50 text-deep-700 ring-deep-200/70',
  growth: 'bg-growth-50 text-growth-700 ring-growth-200/70',
  olive: 'bg-olive-50 text-olive-700 ring-olive-200/70',
  alert: 'bg-alert-50 text-alert-700 ring-alert-200/70',
  neutral: 'bg-mist text-deep-600 ring-deep-200/60',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.1em] ring-1 ring-inset',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
