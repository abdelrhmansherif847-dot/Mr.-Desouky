'use client'

import { useInView } from '@/lib/useInView'
import { useCountUp } from '@/lib/useCountUp'
import { DURATION, EASING } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Progress is always green — it means "growth" in this system.
 * Red is reserved for genuine attention states and is never used
 * simply to mean "a low number".
 *
 * Motion: bars and rings fill only once they are actually on screen, so the
 * student sees the growth happen rather than arriving to a finished bar. The
 * fill is the one place motion is doing real work here — it is the shape of
 * progress itself.
 */

type ProgressBarProps = {
  value: number
  label?: string
  /** Shown at the right of the label row. */
  valueLabel?: string
  tone?: 'growth' | 'sky' | 'olive' | 'alert'
  size?: 'sm' | 'md'
  className?: string
}

const barTones = {
  growth: 'bg-growth-400',
  sky: 'bg-sky-500',
  olive: 'bg-olive-500',
  alert: 'bg-alert-500',
}

export function ProgressBar({
  value,
  label,
  valueLabel,
  tone = 'growth',
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 })

  return (
    <div className={cn('w-full', className)}>
      {label || valueLabel ? (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label ? <span className="text-sm font-medium text-deep-600">{label}</span> : null}
          {valueLabel ? (
            <span className="font-mono text-xs font-semibold tabular-nums text-deep-500">
              {valueLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn(
          'w-full overflow-hidden rounded-full bg-deep-100',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
      >
        {/*
          Width is animated rather than transform-scaled so the rounded end cap
          keeps its shape. It is inside an overflow-hidden track, so nothing
          outside this element can be affected.
        */}
        <div
          className={cn('h-full rounded-full motion-reduce:!transition-none', barTones[tone])}
          style={{
            width: inView ? `${clamped}%` : '0%',
            transition: `width ${DURATION.progress}ms ${EASING.calm}`,
          }}
        />
      </div>
    </div>
  )
}

/** Circular progress ring — used for headline figures on the dashboard. */
export function ProgressRing({
  value,
  size = 132,
  label,
  sublabel,
  tone = 'growth',
}: {
  value: number
  size?: number
  label?: string
  sublabel?: string
  tone?: 'growth' | 'sky'
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const counted = useCountUp(clamped, inView, DURATION.progress)

  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const color = tone === 'growth' ? '#7BCB8B' : '#1597D4'

  return (
    <div
      ref={ref}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? 'Progress'}: ${clamped}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#DCE5EE"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference}
          className="motion-reduce:!transition-none"
          style={{ transition: `stroke-dashoffset ${DURATION.progress}ms ${EASING.calm}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold tabular-nums text-deep-700">
          <span aria-hidden="true">{Math.round(counted)}%</span>
          <span className="sr-only">{clamped}%</span>
        </span>
        {sublabel ? (
          <span className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-400">
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}
