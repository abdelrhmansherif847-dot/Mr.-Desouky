import Link from 'next/link'
import { PreviewNotice } from '@/components/portal/PreviewNotice'
import { Panel, StatTile, StatusPill, DateChip, EmptyState } from '@/components/portal/widgets'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { ArrowRight } from '@/components/ui/Button'
import {
  attendanceRate,
  getStudentRecord,
  homeworkRate,
  latestMock,
  mockTrend,
  quizAverage,
  topicsByStatus,
  upcomingSessions,
} from '@/lib/portal/data'
import { JOURNEY_STAGES } from '@/content/journey'
import { formatLongDate } from '@/lib/utils'

export default async function StudentOverviewPage() {
  const record = await getStudentRecord()
  const attendance = attendanceRate(record)
  const homework = homeworkRate(record)
  const quizAvg = quizAverage(record)
  const mock = latestMock(record)
  const trend = mockTrend(record)
  const upcoming = upcomingSessions(record)
  const stage = JOURNEY_STAGES[record.profile.currentStageIndex]
  const nextStage = JOURNEY_STAGES[record.profile.currentStageIndex + 1]
  const journeyPct = Math.round(((record.profile.currentStageIndex + 1) / JOURNEY_STAGES.length) * 100)
  const weak = topicsByStatus(record, 'weak')
  const strong = topicsByStatus(record, 'strong')
  const latestFeedback = record.feedback[0]

  return (
    <div className="space-y-5">
      <PreviewNotice audience="student" />

      {/* ---------- Where am I ---------- */}
      <section className="overflow-hidden rounded-panel border border-deep-100 bg-white">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8 lg:p-8">
          <div className="flex items-center gap-6 lg:col-span-4">
            <ProgressRing value={journeyPct} sublabel="journey" />
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                Stage {record.profile.currentStageIndex + 1} of {JOURNEY_STAGES.length}
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-deep-700">{stage.title}</h2>
              <p className="mt-1 text-sm text-sky-600">{stage.tagline}</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <p className="text-sm leading-relaxed text-deep-500">{stage.body}</p>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card bg-mist p-4">
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                  What you are doing now
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-deep-600">{stage.studentSees}</dd>
              </div>
              <div className="rounded-card bg-growth-50 p-4">
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-growth-600">
                  What comes next
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-deep-600">
                  {nextStage ? `${nextStage.index} — ${nextStage.title}: ${nextStage.tagline}` : 'Exam day.'}
                </dd>
              </div>
            </dl>

            <Link
              href="/student/journey"
              className="group mt-5 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              See the full journey
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Headline numbers ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Attendance"
          index={0}
          countTo={attendance.rate}
          countSuffix="%"
          value={`${attendance.rate}%`}
          hint={`${attendance.attended} of ${attendance.held} sessions attended`}
          tone={attendance.rate >= 80 ? 'growth' : 'alert'}
        />
        <StatTile
          label="Homework"
          index={1}
          countTo={homework.rate}
          countSuffix="%"
          value={`${homework.rate}%`}
          hint={`${homework.done} of ${homework.due} submitted`}
          tone={homework.rate >= 80 ? 'growth' : 'alert'}
        />
        <StatTile
          label="Quiz average"
          index={2}
          countTo={quizAvg}
          countSuffix="%"
          value={`${quizAvg}%`}
          hint={`Across ${record.quizzes.length} quizzes`}
          tone={quizAvg >= 75 ? 'growth' : 'neutral'}
        />
        <StatTile
          label="Latest mock"
          index={3}
          countTo={mock ? mock.score : undefined}
          value={mock ? mock.score : '—'}
          unit={mock ? `/ ${mock.total}` : undefined}
          hint={trend !== null ? `${trend >= 0 ? '+' : ''}${trend} vs previous mock` : 'First mock'}
          tone={trend !== null && trend > 0 ? 'growth' : 'neutral'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* ---------- Upcoming sessions ---------- */}
        <div className="lg:col-span-7">
          <Panel
            title="Upcoming sessions"
            description="What is next, and what to prepare"
            action={
              <Link href="/student/sessions" className="inline-block py-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
                All sessions
              </Link>
            }
          >
            {upcoming.length === 0 ? (
              <EmptyState>No sessions scheduled.</EmptyState>
            ) : (
              <ul className="space-y-3">
                {upcoming.slice(0, 3).map((session) => (
                  <li key={session.id} className="flex items-start gap-4 rounded-card bg-mist p-4">
                    <DateChip iso={session.date} tone="sky" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-sm font-bold text-deep-700">{session.topic}</p>
                        <StatusPill status={session.status} />
                      </div>
                      <p className="mt-1 text-xs text-deep-400">
                        {formatLongDate(session.date)} · {session.time} · {session.stage}
                      </p>
                      {session.prepare ? (
                        <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-deep-600">
                          {session.prepare}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* ---------- Latest feedback ---------- */}
        <div className="lg:col-span-5">
          <Panel title="Latest feedback" description={latestFeedback?.source}>
            {latestFeedback ? (
              <dl className="space-y-3.5">
                {[
                  { q: 'What happened?', a: latestFeedback.what },
                  { q: 'Why did it happen?', a: latestFeedback.why },
                  { q: 'What should improve?', a: latestFeedback.improve },
                  { q: 'What happens next?', a: latestFeedback.next },
                ].map((item) => (
                  <div key={item.q}>
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-growth-600">
                      {item.q}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-deep-600">{item.a}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <EmptyState>No feedback yet.</EmptyState>
            )}
          </Panel>
        </div>

        {/* ---------- Strengths ---------- */}
        <div className="lg:col-span-6">
          <Panel title="Strengths" description="Topics that are secure — no extra time needed here">
            <ul className="space-y-4">
              {strong.map((topic) => (
                <li key={topic.name}>
                  <ProgressBar
                    label={topic.name}
                    valueLabel={`${topic.score}%`}
                    value={topic.score}
                    tone="growth"
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* ---------- Weaknesses — the one place red belongs ---------- */}
        <div className="lg:col-span-6">
          <Panel
            title="Needs work"
            description="Where the next marks are — this is where study time goes"
          >
            <ul className="space-y-4">
              {[...weak, ...topicsByStatus(record, 'developing')].slice(0, 4).map((topic) => (
                <li key={topic.name}>
                  <ProgressBar
                    label={topic.name}
                    valueLabel={`${topic.score}%`}
                    value={topic.score}
                    tone={topic.status === 'weak' ? 'alert' : 'sky'}
                    size="sm"
                  />
                </li>
              ))}
            </ul>
            <Link
              href="/student/quizzes"
              className="group mt-5 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              See the reviews behind these
              <ArrowRight />
            </Link>
          </Panel>
        </div>

        {/* ---------- Achievements ---------- */}
        <div className="lg:col-span-12">
          <Panel title="Achievements" description="Earned through consistency, not participation">
            <ul className="grid gap-3 sm:grid-cols-3">
              {record.achievements.map((a) => (
                <li key={a.id} className="rounded-card border border-growth-100 bg-growth-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-growth-100 text-growth-700">
                      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                        <path
                          d="M10 2.5 12.2 7l5 .7-3.6 3.5.85 4.95L10 13.8l-4.45 2.35.85-4.95L2.8 7.7l5-.7L10 2.5Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-deep-700">{a.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-deep-500">{a.description}</p>
                      <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
                        {formatLongDate(a.earnedOn)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
