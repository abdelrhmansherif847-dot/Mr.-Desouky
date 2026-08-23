import Link from 'next/link'
import { PreviewNotice } from '@/components/portal/PreviewNotice'
import { Panel, StatTile, StatusPill, DateChip } from '@/components/portal/widgets'
import { ProgressBar } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Card'
import { ArrowRight } from '@/components/ui/Button'
import {
  attendanceRate,
  getParentRecord,
  homeworkRate,
  latestMock,
  mockTrend,
  quizAverage,
  topicsByStatus,
  upcomingSessions,
} from '@/lib/portal/data'
import { JOURNEY_STAGES } from '@/content/journey'
import { formatLongDate } from '@/lib/utils'

export default async function ParentOverviewPage() {
  const record = await getParentRecord()

  return (
    <div className="space-y-5">
      <PreviewNotice audience="parent" />

      {record.children.map((child) => {
        const attendance = attendanceRate(child)
        const homework = homeworkRate(child)
        const quizAvg = quizAverage(child)
        const mock = latestMock(child)
        const trend = mockTrend(child)
        const stage = JOURNEY_STAGES[child.profile.currentStageIndex]
        const upcoming = upcomingSessions(child).slice(0, 2)
        const weak = topicsByStatus(child, 'weak')
        const strong = topicsByStatus(child, 'strong').slice(0, 3)
        const feedback = child.feedback[0]
        const missedHomework = child.homework.filter((h) => h.status === 'missed')
        const missedSessions = child.sessions.filter((s) => s.status === 'missed')
        const needsAttention = missedHomework.length > 0 || missedSessions.length > 0

        return (
          <section
            key={child.profile.id}
            className="overflow-hidden rounded-panel border border-deep-100 bg-white"
          >
            {/* Student header */}
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-deep-100 bg-mist px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-lg font-bold text-deep-700">{child.profile.name}</h2>
                <p className="mt-0.5 text-sm text-deep-500">
                  {child.profile.programTitle} · Stage {child.profile.currentStageIndex + 1} of{' '}
                  {JOURNEY_STAGES.length} — {stage.title}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={child.profile.exam === 'SAT' ? 'sky' : 'olive'}>{child.profile.exam}</Badge>
                <Badge tone="neutral">{child.profile.level}</Badge>
              </div>
            </header>

            <div className="space-y-5 p-5 sm:p-6">
              {/* Attention band — red used only when it is earned */}
              {needsAttention ? (
                <div className="flex items-start gap-3 rounded-card border border-alert-200 bg-alert-50/70 p-4">
                  <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-alert-500" aria-hidden="true">
                    <path
                      d="M8 5v4m0 2.5h.01M8 1.5 14.5 13.5h-13L8 1.5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="font-display text-sm font-bold text-alert-800">Needs attention</p>
                    <p className="mt-1 text-sm leading-relaxed text-alert-800">
                      {[
                        missedSessions.length
                          ? `${missedSessions.length} missed session${missedSessions.length === 1 ? '' : 's'}`
                          : null,
                        missedHomework.length
                          ? `${missedHomework.length} homework set${
                              missedHomework.length === 1 ? '' : 's'
                            } not submitted`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      . Covered in the current catch-up plan.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Headline numbers */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile
                  label="Attendance"
                  value={`${attendance.rate}%`}
                  hint={`${attendance.attended} of ${attendance.held} sessions`}
                  tone={attendance.rate >= 80 ? 'growth' : 'alert'}
                />
                <StatTile
                  label="Homework"
                  value={`${homework.rate}%`}
                  hint={`${homework.done} of ${homework.due} submitted`}
                  tone={homework.rate >= 80 ? 'growth' : 'alert'}
                />
                <StatTile
                  label="Quiz average"
                  value={`${quizAvg}%`}
                  hint={`${child.quizzes.length} quizzes`}
                  tone={quizAvg >= 75 ? 'growth' : 'neutral'}
                />
                <StatTile
                  label="Latest mock"
                  value={mock ? mock.score : '—'}
                  unit={mock ? `/ ${mock.total}` : undefined}
                  hint={trend !== null ? `${trend >= 0 ? '+' : ''}${trend} vs previous` : 'First mock'}
                  tone={trend !== null && trend > 0 ? 'growth' : 'neutral'}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                {/* Strengths and weaknesses */}
                <div className="lg:col-span-7">
                  <div className="h-full rounded-card border border-deep-100 p-4 sm:p-5">
                    <h3 className="font-display text-sm font-bold text-deep-700">
                      Strengths &amp; weaknesses
                    </h3>
                    <p className="mt-1 text-xs text-deep-400">
                      Measured across quizzes, homework and mock exams
                    </p>

                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-growth-600">
                          Secure
                        </p>
                        <ul className="mt-3 space-y-3">
                          {strong.map((t) => (
                            <li key={t.name}>
                              <ProgressBar
                                label={t.name}
                                valueLabel={`${t.score}%`}
                                value={t.score}
                                tone="growth"
                                size="sm"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-alert-600">
                          Being worked on
                        </p>
                        <ul className="mt-3 space-y-3">
                          {weak.map((t) => (
                            <li key={t.name}>
                              <ProgressBar
                                label={t.name}
                                valueLabel={`${t.score}%`}
                                value={t.score}
                                tone="alert"
                                size="sm"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming */}
                <div className="lg:col-span-5">
                  <div className="h-full rounded-card border border-deep-100 p-4 sm:p-5">
                    <h3 className="font-display text-sm font-bold text-deep-700">Upcoming sessions</h3>
                    <ul className="mt-4 space-y-3">
                      {upcoming.map((s) => (
                        <li key={s.id} className="flex items-start gap-3">
                          <DateChip iso={s.date} tone="sky" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-sm font-semibold text-deep-700">
                              {s.topic}
                            </p>
                            <p className="mt-0.5 text-xs text-deep-400">
                              {formatLongDate(s.date)} · {s.time}
                            </p>
                          </div>
                          <StatusPill status={s.status} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Latest feedback */}
              {feedback ? (
                <div className="rounded-card border border-deep-100 p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-deep-700">Latest feedback</h3>
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-deep-300">
                      {feedback.source} · {formatLongDate(feedback.date)}
                    </p>
                  </div>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    {[
                      { q: 'What happened?', a: feedback.what },
                      { q: 'Why did it happen?', a: feedback.why },
                      { q: 'What should improve?', a: feedback.improve },
                      { q: 'What happens next?', a: feedback.next },
                    ].map((item) => (
                      <div key={item.q} className="rounded-lg bg-mist p-3.5">
                        <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-growth-600">
                          {item.q}
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-deep-600">{item.a}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <Link
                href="/parent/reports"
                className="group inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600 hover:text-sky-700"
              >
                See full reports for {child.profile.name}
                <ArrowRight />
              </Link>
            </div>
          </section>
        )
      })}

      <Panel title="Questions about progress?" description="Advising is part of every program">
        <p className="text-sm leading-relaxed text-deep-500">
          If anything here is unclear — a dip, a level decision, or how the exam timeline is looking —
          message directly rather than waiting for the next report.
        </p>
        <Link
          href="/contact"
          className="group mt-4 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          Contact Mr. Desouky
          <ArrowRight />
        </Link>
      </Panel>
    </div>
  )
}
