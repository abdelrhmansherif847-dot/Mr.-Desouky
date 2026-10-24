import { PreviewNotice } from '@/components/portal/PreviewNotice'
import type { ParentPageProps } from '@/components/portal/pages/props'
import { ChildSwitcher } from '@/components/portal/children'
import { AchievementGrid, FeedbackBody } from '@/components/portal/desk'
import { DateChip, EmptyPanel, EmptyState, Panel, StatusPill } from '@/components/portal/widgets'
import { ProgressBar } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Card'
import { attendanceRate, homeworkRate, quizAverage } from '@/lib/portal/insights'
import { formatLongDate, pct } from '@/lib/utils'

/** The full record for one child — every session, set, result and note. */
export default function ParentReportsPage({ base, record, linked, preview }: ParentPageProps) {
  const { profile } = record
  const attendance = attendanceRate(record)
  const homework = homeworkRate(record)
  const quizAvg = quizAverage(record)
  const held = record.sessions.filter((s) => s.status !== 'upcoming').slice().reverse()
  const sets = record.homework.slice().reverse()

  const isEmpty =
    record.sessions.length === 0 &&
    record.homework.length === 0 &&
    record.quizzes.length === 0 &&
    record.mocks.length === 0 &&
    record.feedback.length === 0

  return (
    <div className="space-y-5">
      {preview ? <PreviewNotice audience="parent" /> : null}
      <ChildSwitcher base={base} section="reports" items={linked} selectedId={profile.id} />

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="break-words font-display text-lg font-bold text-deep-700">{profile.name}</h2>
        {profile.programTitle ? (
          <Badge tone={profile.exam === 'EST' ? 'olive' : 'sky'}>{profile.programTitle}</Badge>
        ) : null}
      </div>

      {isEmpty ? (
        <EmptyPanel title="No reports yet" icon="M5 4h14v16H5V4Zm4 5h6M9 13h6M9 17h3">
          Reports build up session by session. The first entries appear once Mr. Desouky records a
          session, a homework set or a result.
        </EmptyPanel>
      ) : (
        <>
          <Panel
            title="Phase summary"
            description={
              profile.targetExamDate ? `Target exam date: ${formatLongDate(profile.targetExamDate)}` : 'Exam date not set yet'
            }
          >
            <dl className="grid gap-4 sm:grid-cols-3">
              <SummaryCell
                label="Attendance"
                value={attendance.held ? attendance.rate : null}
                tone={attendance.rate >= 80 ? 'growth' : 'alert'}
                hint={attendance.held ? `${attendance.attended} of ${attendance.held} sessions attended` : 'No sessions held yet'}
              />
              <SummaryCell
                label="Homework completion"
                value={homework.due ? homework.rate : null}
                tone={homework.rate >= 80 ? 'growth' : 'alert'}
                hint={homework.due ? `${homework.done} of ${homework.due} sets handed in` : 'Nothing due yet'}
              />
              <SummaryCell
                label="Quiz average"
                value={record.quizzes.length ? quizAvg : null}
                tone={quizAvg >= 75 ? 'growth' : 'sky'}
                hint={record.quizzes.length ? `Across ${record.quizzes.length} quiz${record.quizzes.length === 1 ? '' : 'zes'}` : 'No quizzes yet'}
              />
            </dl>
          </Panel>

          <Panel title="Attendance record" description="Every session held, newest first">
            {held.length ? (
              <ul className="divide-y divide-deep-100">
                {held.map((s) => (
                  <li key={s.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <DateChip iso={s.date} />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-deep-700">{s.topic}</p>
                      <p className="mt-0.5 text-xs text-deep-400">{s.stage}</p>
                    </div>
                    <StatusPill status={s.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>No sessions held yet.</EmptyState>
            )}
          </Panel>

          <Panel title="Homework record" description="What was set, what was handed in, and when">
            {sets.length ? (
              <ul className="divide-y divide-deep-100">
                {sets.map((h) => (
                  <li key={h.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <DateChip iso={h.dueOn} />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-deep-700">{h.title}</p>
                      <p className="mt-0.5 text-xs text-deep-400">
                        {h.topic} · due {formatLongDate(h.dueOn)}
                      </p>
                    </div>
                    {typeof h.score === 'number' ? (
                      <span className="font-mono text-sm font-semibold tabular-nums text-deep-600">{h.score}%</span>
                    ) : null}
                    <StatusPill status={h.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>No homework set yet.</EmptyState>
            )}
          </Panel>

          <Panel title="Quiz & mock performance" description="Scores over time, not one best result">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">Quizzes</p>
                {record.quizzes.length ? (
                  <ul className="mt-4 space-y-4">
                    {record.quizzes.map((q) => {
                      const score = pct(q.score, q.total)
                      return (
                        <li key={q.id}>
                          <ProgressBar
                            label={q.title}
                            valueLabel={`${q.score}/${q.total}`}
                            value={score}
                            tone={score >= 80 ? 'growth' : 'sky'}
                            size="sm"
                          />
                          <p className="mt-1 text-xs text-deep-400">{formatLongDate(q.date)}</p>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-deep-400">No quizzes yet.</p>
                )}
              </div>
              <div>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">Mock exams</p>
                {record.mocks.length ? (
                  <ul className="mt-4 space-y-4">
                    {record.mocks.map((m) => (
                      <li key={m.id}>
                        <ProgressBar
                          label={`${m.label} — ${formatLongDate(m.date)}`}
                          valueLabel={`${m.score}/${m.total}`}
                          value={pct(m.score, m.total)}
                          tone="olive"
                          size="sm"
                        />
                        {m.note ? <p className="mt-1.5 text-xs leading-relaxed text-deep-500">{m.note}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-deep-400">No mock exams yet.</p>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Written feedback" description="After quizzes, mocks and reviews">
            {record.feedback.length ? (
              <ul className="space-y-4">
                {record.feedback.map((f) => (
                  <li key={f.id} className="rounded-card border border-deep-100 p-4 sm:p-5">
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-sm font-bold text-deep-700">{f.source}</p>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
                        {formatLongDate(f.date)}
                      </p>
                    </div>
                    <FeedbackBody note={f} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>No written feedback yet.</EmptyState>
            )}
          </Panel>

          {record.achievements.length ? (
            <Panel title="Achievements" description="Earned through consistency, not participation">
              <AchievementGrid items={record.achievements} />
            </Panel>
          ) : null}
        </>
      )}
    </div>
  )
}

function SummaryCell({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: number | null
  hint: string
  tone: 'growth' | 'alert' | 'sky'
}) {
  return (
    <div className="rounded-card bg-mist p-4">
      <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">{label}</dt>
      <dd className="mt-2">
        {value === null ? (
          <p className="font-display text-xl font-bold text-deep-300">—</p>
        ) : (
          <ProgressBar value={value} valueLabel={`${value}%`} tone={tone} size="sm" />
        )}
        <p className="mt-2 text-xs text-deep-500">{hint}</p>
      </dd>
    </div>
  )
}
