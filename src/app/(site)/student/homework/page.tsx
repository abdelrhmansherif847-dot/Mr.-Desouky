import { PreviewNotice } from '@/components/portal/PreviewNotice'
import { Panel, StatTile, StatusPill, DateChip } from '@/components/portal/widgets'
import { getStudentRecord, homeworkRate } from '@/lib/portal/data'
import { formatLongDate } from '@/lib/utils'

export default async function StudentHomeworkPage() {
  const record = await getStudentRecord()
  const rate = homeworkRate(record)
  const pending = record.homework.filter((h) => h.status === 'pending')
  const done = record.homework.filter((h) => h.status !== 'pending').reverse()
  const scored = record.homework.filter((h) => typeof h.score === 'number')
  const average = scored.length
    ? Math.round(scored.reduce((s, h) => s + (h.score ?? 0), 0) / scored.length)
    : 0

  return (
    <div className="space-y-5">
      <PreviewNotice audience="student" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Completion"
          value={`${rate.rate}%`}
          hint={`${rate.done} of ${rate.due} submitted`}
          tone={rate.rate >= 80 ? 'growth' : 'alert'}
        />
        <StatTile label="Average score" value={`${average}%`} hint={`Across ${scored.length} sets`} />
        <StatTile label="Due now" value={pending.length} tone={pending.length ? 'sky' : 'neutral'} />
        <StatTile
          label="Not submitted"
          value={record.homework.filter((h) => h.status === 'missed').length}
          tone={record.homework.some((h) => h.status === 'missed') ? 'alert' : 'neutral'}
        />
      </div>

      {pending.length > 0 ? (
        <Panel title="Due now" description="Complete these before the next session">
          <ul className="space-y-3">
            {pending.map((hw) => (
              <li key={hw.id} className="flex items-start gap-4 rounded-card bg-sky-50/60 p-4">
                <DateChip iso={hw.dueOn} tone="sky" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-bold text-deep-700">{hw.title}</p>
                    <StatusPill status={hw.status} />
                  </div>
                  <p className="mt-1 text-xs text-deep-400">
                    {hw.topic} · due {formatLongDate(hw.dueOn)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Homework history" description="Corrected with written notes — not just ticked">
        <ul className="divide-y divide-deep-100">
          {done.map((hw) => (
            <li key={hw.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-4">
                <DateChip iso={hw.dueOn} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-bold text-deep-700">{hw.title}</p>
                    <StatusPill status={hw.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-deep-400">
                    {hw.topic} · set {formatLongDate(hw.setOn)}
                  </p>
                  {hw.note ? (
                    <p className="mt-2 rounded-lg bg-mist px-3 py-2 text-xs leading-relaxed text-deep-600">
                      {hw.note}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  {typeof hw.score === 'number' ? (
                    <>
                      <p className="font-display text-lg font-bold tabular-nums text-deep-700">
                        {hw.score}
                        <span className="text-xs font-medium text-deep-400">%</span>
                      </p>
                    </>
                  ) : (
                    <p className="font-mono text-xs text-deep-300">—</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
