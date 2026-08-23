import { cn } from '@/lib/utils'

/**
 * Mathematical visual language — the workbook connection.
 * Purely decorative, always low-contrast, never near the logo.
 * These are typographic glyphs, NOT a reinterpretation of the brand mark.
 */

const GLYPHS = ['√', 'π', 'Σ', 'x²', '∫', '≠', '∞', 'Δ', '≤', 'θ', '±', 'f(x)']

type MathTextureProps = {
  className?: string
  tone?: 'light' | 'dark'
  density?: 'sparse' | 'normal'
}

export function MathTexture({ className, tone = 'light', density = 'normal' }: MathTextureProps) {
  const glyphs = density === 'sparse' ? GLYPHS.slice(0, 6) : GLYPHS

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 select-none overflow-hidden mask-fade-radial',
        className,
      )}
    >
      <div className="flex h-full w-full flex-wrap items-center justify-around gap-x-10 gap-y-8 p-6">
        {glyphs.map((glyph, i) => (
          <span
            key={`${glyph}-${i}`}
            className={cn(
              'font-mono leading-none',
              tone === 'dark' ? 'text-white/[0.07]' : 'text-deep-700/[0.055]',
              i % 3 === 0 ? 'text-6xl sm:text-8xl' : i % 3 === 1 ? 'text-4xl sm:text-6xl' : 'text-5xl sm:text-7xl',
            )}
          >
            {glyph}
          </span>
        ))}
      </div>
    </div>
  )
}

/** A single oversized glyph used as a quiet section marker. */
export function GlyphMark({
  glyph,
  className,
  tone = 'light',
}: {
  glyph: string
  className?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none select-none font-mono leading-none',
        tone === 'dark' ? 'text-white/10' : 'text-deep-700/[0.06]',
        className,
      )}
    >
      {glyph}
    </span>
  )
}
