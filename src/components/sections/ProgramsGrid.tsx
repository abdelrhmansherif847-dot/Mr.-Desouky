import Link from 'next/link'
import { Badge } from '@/components/ui/Card'
import { Reveal } from '@/components/motion/Reveal'
import { ArrowRight } from '@/components/ui/Button'
import { PROGRAMS, TRACKS, type ExamTrack } from '@/content/programs'
import { cn } from '@/lib/utils'

/**
 * SAT and EST are presented as two separate columns — never mixed,
 * never interleaved in one list.
 */
export function ProgramsGrid({ compact = false }: { compact?: boolean }) {
  const tracks: ExamTrack[] = ['SAT', 'EST']

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      {tracks.map((track, trackIndex) => {
        const programs = PROGRAMS.filter((p) => p.exam === track)
        const meta = TRACKS[track]

        return (
          <Reveal
            key={track}
            variant={trackIndex === 0 ? 'left' : 'right'}
            delay={trackIndex * 90}
            className="flex flex-col overflow-hidden rounded-panel border border-deep-100 bg-white"
          >
            {/* Track header */}
            <div
              className={cn(
                'border-b border-deep-100 p-6 sm:p-8',
                track === 'SAT' ? 'bg-sky-50/60' : 'bg-olive-50/50',
              )}
            >
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl font-bold text-deep-700">{meta.name}</h3>
                <Badge tone={track === 'SAT' ? 'sky' : 'olive'}>{track}</Badge>
              </div>
              {!compact ? (
                <p className="mt-3 text-sm leading-relaxed text-deep-500">{meta.blurb}</p>
              ) : null}
            </div>

            {/* Levels */}
            <ul className="flex flex-1 flex-col divide-y divide-deep-100">
              {programs.map((program) => (
                <li key={program.slug} className="flex-1">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="group flex h-full flex-col p-6 transition-colors duration-300 ease-calm hover:bg-mist sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-deep-300">
                          Level
                        </p>
                        <h4 className="mt-1.5 font-display text-xl font-bold text-deep-700 group-hover:text-sky-600">
                          {program.level}
                        </h4>
                      </div>
                      <span className="mt-1 text-sky-500">
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>

                    <p className="mt-3 font-display text-[0.95rem] font-semibold text-deep-600">
                      {program.tagline}
                    </p>

                    {!compact ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-deep-500">
                        {program.summary}
                      </p>
                    ) : null}

                    <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-deep-100 pt-4">
                      <div>
                        <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                          Duration
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-deep-600">
                          {program.duration}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                          Sessions
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-deep-600">
                          {program.sessions}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )
      })}
    </div>
  )
}
