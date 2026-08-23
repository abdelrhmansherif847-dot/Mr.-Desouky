import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'growth'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-all duration-300 ease-calm disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  // Sky blue — the primary "Learn" action.
  primary:
    'bg-sky-500 text-white shadow-card hover:bg-sky-600 hover:shadow-lift active:bg-sky-700',
  // Deep blue outline — supporting action.
  secondary:
    'border border-deep-200 bg-white text-deep-700 hover:border-deep-400 hover:bg-deep-50 active:bg-deep-100',
  ghost: 'text-deep-700 hover:bg-deep-50 active:bg-deep-100',
  // For use on deep-blue sections.
  onDark:
    'border border-white/25 bg-white/5 text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/12',
  growth:
    'bg-growth-500 text-white shadow-card hover:bg-growth-600 hover:shadow-lift active:bg-growth-700',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[0.95rem] sm:px-6 sm:py-3',
  lg: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-[1.05rem]',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonLinkProps = CommonProps & {
  href: string
  external?: boolean
}

export function ButtonLink({
  href,
  external,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<'button'>

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  )
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn('h-4 w-4 transition-transform duration-300 ease-calm group-hover:translate-x-1', className)}
    >
      <path
        d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
