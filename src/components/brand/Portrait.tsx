import Image from 'next/image'
import { PORTRAIT } from '@/content/site'
import { cn } from '@/lib/utils'

/**
 * The portrait is used STRATEGICALLY — home hero, about, course intro,
 * mentoring. It is deliberately absent from worksheets, dashboards and
 * ordinary content blocks. Swap the file at public/brand/portrait.svg.
 */

type PortraitProps = {
  className?: string
  priority?: boolean
  /** 'frame' adds the deep-blue offset frame used in editorial sections. */
  treatment?: 'plain' | 'frame'
  sizes?: string
}

export function Portrait({
  className,
  priority = false,
  treatment = 'plain',
  sizes = '(min-width: 1024px) 30rem, 90vw',
}: PortraitProps) {
  const image = (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-panel bg-deep-100">
      <Image
        src={PORTRAIT.src}
        alt={PORTRAIT.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  )

  if (treatment === 'plain') {
    return <div className={cn('relative', className)}>{image}</div>
  }

  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className="absolute -bottom-4 -right-4 h-full w-full rounded-panel border border-sky-200 bg-sky-50 sm:-bottom-5 sm:-right-5"
      />
      <div className="relative">{image}</div>
    </div>
  )
}
