import { cn } from '@/lib/utils'

/**
 * A plotted curve on a coordinate plane — the one piece of imagery on the
 * sign-in screen, and the whole idea of the brand in a single mark:
 * mathematics as the language, progress as the subject.
 *
 * It is drawn rather than shown. The line traces itself left to right over
 * 1.8s and the points arrive on it in order, so the composition states
 * "this goes forward" before a word is read. Then it stops — nothing here
 * loops, so it costs nothing after the first paint.
 *
 * Deliberately not a chart: no numbers, no axis labels, no claim about any
 * score. It is editorial texture that happens to be mathematically literate.
 *
 * Purely decorative and low contrast, so it never competes with the copy and
 * is hidden from assistive technology. Under reduced motion the global rule
 * removes the animation and the finished curve is simply present.
 */

/** Rising, easing off at the top — improvement that is real but not magic. */
const CURVE = 'M 18 86 C 60 84, 92 72, 140 64 S 226 50, 268 36 S 344 20, 382 12'

/** Where the points sit on it, in order of arrival. */
const POINTS = [
  { x: 18, y: 86 },
  { x: 140, y: 64 },
  { x: 268, y: 36 },
  { x: 382, y: 12 },
]

export function ProgressPlot({
  className,
  /** The parent view marks where the student has reached. */
  annotated = false,
}: {
  className?: string
  annotated?: boolean
}) {
  const last = POINTS[POINTS.length - 1]

  return (
    <svg
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    >
      <defs>
        <linearGradient id="plot-line" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1597D4" stopOpacity="0.25" />
          <stop offset="55%" stopColor="#3FACE1" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7BCB8B" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="plot-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1597D4" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#1597D4" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* The baseline the four stages sit on. */}
      <line x1="18" y1="97" x2="382" y2="97" stroke="#AEDDF5" strokeOpacity="0.16" strokeWidth="0.8" />
      {POINTS.map((point) => (
        <line
          key={`tick-${point.x}`}
          x1={point.x}
          y1="94"
          x2={point.x}
          y2="100"
          stroke="#AEDDF5"
          strokeOpacity="0.22"
          strokeWidth="0.8"
        />
      ))}

      {/* The area under the curve, barely there — it gives the line weight. */}
      <path d={`${CURVE} L 382 100 L 18 100 Z`} fill="url(#plot-area)" />

      {/* Where the student has reached, for the parent view. */}
      {annotated ? (
        <g stroke="#AEDDF5" strokeOpacity="0.28" strokeWidth="0.8" strokeDasharray="4 4">
          <line x1={last.x} y1={last.y} x2={last.x} y2="100" />
          <line x1="18" y1={last.y} x2={last.x} y2={last.y} />
        </g>
      ) : null}

      <path
        d={CURVE}
        fill="none"
        stroke="url(#plot-line)"
        strokeWidth="1.4"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        className="animate-draw-path"
        vectorEffect="non-scaling-stroke"
      />

      {POINTS.map((point, index) => (
        <circle
          key={`${point.x}-${point.y}`}
          cx={point.x}
          cy={point.y}
          r="3.2"
          fill={index === POINTS.length - 1 ? '#7BCB8B' : '#AEDDF5'}
          fillOpacity={index === POINTS.length - 1 ? 0.9 : 0.45}
          className="animate-plot-point"
          style={{
            animationDelay: `${420 + index * 380}ms`,
            transformOrigin: `${point.x}px ${point.y}px`,
          }}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
