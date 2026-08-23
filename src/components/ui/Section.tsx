import type { ElementType, ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'

type Tone = 'paper' | 'mist' | 'deep' | 'deepSoft'

const tones: Record<Tone, string> = {
  paper: 'bg-paper text-deep-800',
  mist: 'bg-mist text-deep-800',
  deep: 'bg-deep-700 text-deep-100',
  deepSoft: 'bg-deep-800 text-deep-100',
}

type SectionProps = {
  id?: string
  tone?: Tone
  /** Adds the subtle graph-paper texture used across the brand. */
  grid?: boolean
  className?: string
  containerClassName?: string
  children: ReactNode
  as?: ElementType
}

export function Section({
  id,
  tone = 'paper',
  grid = false,
  className,
  containerClassName,
  children,
  as: Tag = 'section',
}: SectionProps) {
  const isDark = tone === 'deep' || tone === 'deepSoft'

  return (
    <Tag id={id} className={cn('relative overflow-hidden', tones[tone], className)}>
      {grid ? (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 mask-fade-b',
            isDark ? 'texture-grid-dark' : 'texture-grid',
          )}
        />
      ) : null}
      <div className={cn('container-page relative py-16 sm:py-20 lg:py-28', containerClassName)}>
        {children}
      </div>
    </Tag>
  )
}

type HeadingProps = {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
  /** Heading level — keep the document outline correct. */
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'light',
  className,
  as: Tag = 'h2',
}: HeadingProps) {
  const dark = tone === 'dark'

  return (
    <Reveal
      variant="up"
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn('eyebrow mb-3', dark ? 'text-sky-300' : 'text-sky-600')}>
          <span
            aria-hidden="true"
            className={cn(
              'mr-2.5 inline-block h-px w-6 align-middle',
              dark ? 'bg-sky-300/60' : 'bg-sky-500/50',
            )}
          />
          {eyebrow}
        </p>
      ) : null}

      <Tag
        className={cn(
          Tag === 'h1' ? 'text-display-lg' : 'text-display-md',
          dark ? 'text-white' : 'text-deep-700',
        )}
      >
        {title}
      </Tag>

      {lead ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed sm:mt-5 sm:text-lg',
            dark ? 'text-deep-100/80' : 'text-deep-500',
            align === 'center' && 'mx-auto',
          )}
        >
          {lead}
        </p>
      ) : null}
    </Reveal>
  )
}
