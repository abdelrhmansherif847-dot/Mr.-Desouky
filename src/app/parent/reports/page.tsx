import { PreviewNotice } from '@/components/portal/PreviewNotice'
import { Panel, StatusPill, DateChip } from '@/components/portal/widgets'
import { ProgressBar } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Card'
import { getParentRecord, attendanceRate, homeworkRate, quizAverage } from '@/lib/portal/data'
import { formatLongDate, pct } from '@/lib/utils'

export default async function ParentReportsPage() {
  const record = await getParentRecord()

  return (
    <div className="space-y-5">
      <PreviewNotice audience="parent" />

      {record.children.map((child) => {
        const attendance = attendanceRate(child)
        const homework = homeworkRate(child)
        const quizAvg = quizAverage(child)

        return (
          <div key={child.profile.id} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-lg font-bold text-deep-700">{child.profile.name}</h2>
              <Badge tone={child.profile.exam === 'SAT' ? 'sky' : 'olive'}>
                {child.profile.programTitle}
              </Badge>
            </div>

            {/* Phase summary */}
            <Panel
              title="Phase summary"
              description={`Target exam date: ${formatLongDate(child.profile.targetExamDate)}`}
            >
              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-card bg-mist p-4">
                  <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">
                    Attendance
                  </dt>
                  <dd className="mt-2">
                    <ProgressBar value={attendance.rate} valueLabel={`${attendance.rate}%`} tone={attendance.rate >= 80 ? 'growth' : 'alert'} size="sm" />
                    <p className="mt-2 text-xs text-deep-500">
                      {attendance.attended} of {attendance.held} sessions attended
                    </p>
                  </dd>
                </div>
                <div className="rounded-card bg-mist p-4">
                  <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">
                    Homework completion
                  </dt>
                  <dd className="mt-2">
                    <ProgressBar value={homework.rate} valueLabel={`${homework.rate}%`} tone={homework.rate >= 80 ? 'growth' : 'alert'} size="sm" />
                    <p className="mt-2 text-xs text-deep-500">
                      {homework.done} of {homework.due} sets submitted
                    </p>
                  </dd>
                </div>
                <div className="rounded-card bg-mist p-4">
                  <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">
                    Quiz average
                  </dt>
                  <dd className="mt-2">
                    <ProgressBar value={quizAvg} valueLabel={`${quizAvg}%`} tone={quizAvg >= 75 ? 'growth' : 'sky'} size="sm" />
                    <p className="mt-2 text-xs text-deep-500">
                      Across {child.quizzes.length} quizzes
                    </p>
                  </dd>
                </div>
              </dl>
            </Panel>

            {/* Attendance detail */}
            <Panel title="Attendance record" description="Every session, recorded">
              <ul className="divide-y divide-deep-100">
                {child.sessions
                  .filter((s) => s.status !== 'upcoming')
                  .reverse()
                  .map((s) => (
                    <li key={s.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <DateChip iso={s.date} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-deep-700">{s.topic}</p>
                        <p className="mt-0.5 text-xs text-deep-400">{s.stage}</p>
                      </div>
                      <StatusPill status={s.status} />
                    </li>
                  ))}
              </ul>
            </Panel>

            {/* Homework detail */}
            <Panel title="Homework record" description="What was set, what was submitted, and when">
              <ul className="divide-y divide-deep-100">
                {child.homework
                  .slice()
                  .reverse()
                  .map((h) => (
                    <li key={h.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <DateChip iso={h.dueOn} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-deep-700">{h.title}</p>
                        <p className="mt-0.5 text-xs text-deep-400">
                          {h.topic} · due {formatLongDate(h.dueOn)}
                        </p>
                      </div>
                      {typeof h.score === 'number' ? (
                        <span className="font-mono text-sm font-semibold tabular-nums text-deep-600">
                          {h.score}%
                        </span>
                      ) : null}
                      <StatusPill status={h.status} />
                    </li>
                  ))}
              </ul>
            </Panel>

            {/* Quiz & mock performance */}
            <Panel title="Quiz &amp; mock performance" description="Scores over time, not one best result">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                    Quizzes
                  </p>
                  <ul className="mt-4 space-y-4">
                    {child.quizzes.map((q) => {
                      const score = pct(q.score, q.total)
                      return (
                        <li key={q.id}>
                          <ProgressBar
                            label={q.title}
                            valueLabel={`${q.score}/${q.total}`}
                            value={score}
                            tone={score >= 80 ? 'growth' : score >= 60 ? 'sky' : 'alert'}
                            size="sm"
                          />
                          <p className="mt-1 text-xs text-deep-400">{formatLongDate(q.date)}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                    Mock exams
                  </p>
                  <ul className="mt-4 space-y-4">
                    {child.mocks.map((m) => (
                      <li key={m.id}>
                        <ProgressBar
                          label={`${m.label} — ${formatLongDate(m.date)}`}
                          valueLabel={`${m.score}/${m.total}`}
                          value={pct(m.score, m.total)}
                          tone="growth"
                          size="sm"
                        />
                        <p className="mt-1.5 text-xs leading-relaxed text-deep-500">{m.note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>

            {/* Written feedback log */}
            <Panel title="Written feedback" description="After every quiz and every mock">
              <ul className="space-y-4">
                {child.feedback.map((f) => (
                  <li key={f.id} className="rounded-card border border-deep-100 p-4 sm:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-sm font-bold text-deep-700">{f.source}</p>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
                        {formatLongDate(f.date)}
                      </p>
                    </div>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        { q: 'What happened?', a: f.what },
                        { q: 'Why did it happen?', a: f.why },
                        { q: 'What should improve?', a: f.improve },
                        { q: 'What happens next?', a: f.next },
                      ].map((item) => (
                        <div key={item.q} className="rounded-lg bg-mist p-3">
                          <dt className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-growth-600">
                            {item.q}
                          </dt>
                          <dd className="mt-1 text-sm leading-relaxed text-deep-600">{item.a}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        )
      })}
    </div>
  )
}
