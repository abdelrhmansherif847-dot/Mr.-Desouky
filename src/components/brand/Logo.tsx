import Link from 'next/link'
import Image from 'next/image'
import { LOGO, SITE } from '@/content/site'
import { cn } from '@/lib/utils'

/**
 * The official logo is used AS-IS from /public/brand.
 * It is never redrawn, recoloured or reconstructed in code — the component
 * only positions it and sets the wordmark beside it.
 * See public/brand/README.md to swap in the approved files.
 */

type LogoProps = {
  variant?: 'color' | 'mono'
  /** Extra classes for the role line — lets the header hide it where space is tight. */
  roleClassName?: string
  /** Extra classes for the name — lets the header shrink it where space is tight. */
  nameClassName?: string
  /** Hides the typographic wordmark and shows the mark alone. */
  markOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const markSizes = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
}

const pixelSizes = { sm: 36, md: 44, lg: 56 }

export function LogoMark({ variant = 'color', size = 'md', className }: Omit<LogoProps, 'markOnly'>) {
  const src = variant === 'mono' ? LOGO.mono : LOGO.color

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        markSizes[size],
        variant === 'mono' && 'text-current',
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        priority
        className="h-full w-full object-contain"
      />
    </span>
  )
}

export function Logo({ variant = 'color', markOnly = false, size = 'md', className, roleClassName, nameClassName }: LogoProps) {
  const dark = variant === 'mono'

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark variant={variant} size={size} />
      {!markOnly ? (
        <span className="flex flex-col whitespace-nowrap leading-none">
          <span
            className={cn(
              'font-display text-[0.98rem] font-bold tracking-tight sm:text-[1.05rem]',
              dark ? 'text-white' : 'text-deep-700',
              nameClassName,
            )}
          >
            {SITE.name}
          </span>
          <span
            className={cn(
              'mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] sm:text-[0.65rem]',
              dark ? 'text-sky-300' : 'text-sky-600',
              roleClassName,
            )}
          >
            {SITE.role}
          </span>
        </span>
      ) : null}
    </span>
  )
}

export function LogoLink({ variant = 'color', size = 'md', className, roleClassName, nameClassName }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — home`}
      className={cn('group inline-flex items-center rounded-lg', className)}
    >
      <Logo variant={variant} size={size} roleClassName={roleClassName} nameClassName={nameClassName} />
    </Link>
  )
}
