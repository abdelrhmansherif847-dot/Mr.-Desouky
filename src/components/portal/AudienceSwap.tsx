import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AUDIENCES, type Audience } from './audience'

/**
 * The hand-over between the two portals' copy.
 *
 * Both portals' words are rendered, stacked in a single grid cell, and only
 * one of them is shown. Two things follow from that, and both matter:
 *
 *   The block is always as tall as the taller of the two, so nothing below it
 *   moves when the copy changes. Rendering one at a time was measured shifting
 *   the sign-in card 26px on a 375px screen — a page that jumps under your
 *   thumb mid-transition, which is the opposite of the point.
 *
 *   The copy leaving and the copy arriving move at the same time, rather than
 *   one waiting for the other. That is what makes it read as travel between
 *   two places instead of a redraw.
 *
 * The direction is geometric, not remembered: Student parks to the left and
 * Parent to the right, because that is where they sit in the control above.
 * Press Parent and its words arrive from the right while the student's leave
 * to the left, in the same direction the indicator itself slides. No state
 * tracks which way the visitor moved — the layout already knows.
 *
 * The side that is not showing is inert and hidden from assistive technology,
 * so it is neither focusable nor readable: present in the document only to
 * hold the height and carry the movement.
 */
export function AudienceSwap({
  audience,
  className,
  render,
}: {
  audience: Audience
  className?: string
  render: (audience: Audience) => ReactNode
}) {
  return (
    <div className={cn('grid', className)}>
      {AUDIENCES.map((value) => {
        const active = value === audience
        return (
          <div
            key={value}
            inert={!active}
            aria-hidden={!active}
            className={cn(
              'col-start-1 row-start-1',
              'transition-[opacity,transform,visibility] duration-[420ms] ease-calm',
              'motion-reduce:transition-none',
              active
                ? 'visible translate-x-0 opacity-100'
                : cn('invisible opacity-0', value === 'student' ? '-translate-x-3.5' : 'translate-x-3.5'),
            )}
          >
            {render(value)}
          </div>
        )
      })}
    </div>
  )
}
