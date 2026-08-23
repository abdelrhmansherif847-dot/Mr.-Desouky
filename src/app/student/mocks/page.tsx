import { PreviewNotice } from '@/components/portal/PreviewNotice'
import { Panel, StatTile } from '@/components/portal/widgets'
import { ProgressBar } from '@/components/ui/Progress'
import { getStudentRecord, latestMock, mockTrend } from '@/lib/portal/data'
import { formatLongDate, pct } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default async function StudentMocksPage() {
  const record = await getStudentRecord()
  const latest = latestMock(record)
  const trend = mockTrend(record)
  const best = record.mocks.reduce((max, m) => (m.score > max ? m.score : max), 0)

  // Simple trend chart geometry — no chart library needed for a handful of points.
  const maxScore = latest?.total ?? 800
  const points = record.mocks.map((m, i) => ({
    x: record.mocks.length === 1 ? 50 : (i / (record.mocks.length - 1)) * 100,
    y: 100 - (m.score / maxScore) * 100,
    mock: m,
  }))

  return (
    <div className="space-y-5">
      <PreviewNotice audience="student" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Latest mock"
          value={latest ? latest.score : '—'}
          unit={latest ? `/ ${latest.total}` : undefined}
        />
        <StatTile
          label="Change"
          value={trend !== null ? `${trend >= 0 ? '+' : ''}${trend}` : '—'}
          hint="vs previous mock"
          tone={trend !== null && trend > 0 ? 'growth' : 'neutral'}
        />
        <StatTile label="Best" value={best || '—'} />
        <StatTile label="Mocks taken" value={record.mocks.length} />
      </div>

      {/* Trend */}
      <Panel title="Score trend" description="The trend matters more than any single result">
        <div className="relative h-44 w-full sm:h-52">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#DCE5EE" strokeWidth="0.4" />
            ))}
            {points.length > 1 ? (
              // The trend draws itself left to right: the line is the progress.
              <polyline
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#7BCB8B"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                pathLength={100}
                strokeDasharray="100"
                style={{ ['--draw-length' as string]: '100' }}
                className="[animation:draw-line_1.1s_cubic-bezier(0.16,1,0.3,1)_0.15s_both] motion-reduce:![animation:none]"
              />
            ) : null}
            {points.map((p, i) => (
              <circle
                key={p.mock.id}
                cx={p.x}
                cy={p.y}
                r="1.4"
                fill="#3F9C57"
                vectorEffect="non-scaling-stroke"
                className="animate-fade-in motion-reduce:animate-none"
                style={{ animationDelay: `${250 + i * 260}ms` }}
              />
            ))}
          </svg>
        </div>
        <ul className="mt-4 flex justify-between border-t border-deep-100 pt-3">
          {record.mocks.map((m) => (
            <li key={m.id} className="text-center">
              <p className="font-display text-sm font-bold tabular-nums text-deep-700">{m.score}</p>
              <p className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-deep-300">
                {m.label}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-deep-400">
          Scores shown out of {maxScore}. A mock is only useful once it is reviewed — the analysis
          below is where the marks come from.
        </p>
      </Panel>

      {/* Each mock */}
      {[...record.mocks].reverse().map((mock) => (
        <Panel
          key={mock.id}
          title={mock.label}
          description={formatLongDate(mock.date)}
          action={
            <span className="font-display text-lg font-bold tabular-nums text-deep-700">
              {mock.score}
              <span className="text-sm font-medium text-deep-400">/{mock.total}</span>
            </span>
          }
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                Accuracy by module
              </p>
              <ul className="mt-4 space-y-4">
                {mock.modules.map((mod) => {
                  const acc = pct(mod.correct, mod.total)
                  return (
                    <li key={mod.name}>
                      <ProgressBar
                        label={mod.name}
                        valueLabel={`${mod.correct}/${mod.total}`}
                        value={acc}
                        tone={acc >= 80 ? 'growth' : acc >= 60 ? 'sky' : 'alert'}
                        size="sm"
                      />
                    </li>
                  )
                })}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                Timing
              </p>
              <ul className="mt-4 space-y-3">
                {mock.modules.map((mod) => {
                  const tight = mod.minutesUsed >= mod.minutesAllowed
                  return (
                    <li
                      key={mod.name}
                      className="flex items-center justify-between gap-3 rounded-card bg-mist px-3.5 py-3"
                    >
                      <span className="text-sm font-medium text-deep-600">{mod.name}</span>
                      <span
                        className={cn(
                          'font-mono text-xs font-semibold tabular-nums',
                          tight ? 'text-alert-600' : 'text-growth-600',
                        )}
                      >
                        {mod.minutesUsed} / {mod.minutesAllowed} min
                      </span>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/70 px-3.5 py-3">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-sky-700">
                  Review note
                </p>
                <p className="mt-1 text-sm leading-relaxed text-deep-700">{mock.note}</p>
              </div>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  )
}
