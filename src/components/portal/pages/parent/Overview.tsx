import { PreviewNotice } from '@/components/portal/PreviewNotice'
import type { ParentPageProps } from '@/components/portal/pages/props'
import { ChildSwitcher, childHref } from '@/components/portal/children'
import {
  FeedbackBody,
  HomeworkList,
  NextSessionCard,
  ResultsList,
  SectionLink,
  SessionList,
  TopicBars,
} from '@/components/portal/desk'
import { EmptyPanel, Panel, StatTile } from '@/components/portal/widgets'
import { Badge } from '@/components/ui/Card'
import {
  attendanceRate,
  comingSessions,
  focusTopics,
  homeworkRate,
  latestMock,
  mockTrend,
  outstandingHomework,
  quizAverage,
  recentResults,
  topicsByStatus,
} from '@/lib/portal/insights'
import { JOURNEY_STAGES } from '@/content/journey'
import { formatLongDate } from '@/lib/utils'

/**
 * One child, as their parent sees them: where they are, what is next, what
 * needs attention, and what Mr. Desouky last wrote. Only what was recorded
 * for this child and shared with parents reaches this page — the database
 * filters internal and student-only notes before anything is sent.
 */
export default function ParentOverviewPage({ base, record, linked, preview }: ParentPageProps) {
  const { profile } = record
  const attendance = attendanceRate(record)
  const homework = homeworkRate(record)
  const mock = latestMock(record)
  const trend = mockTrend(record)
  const coming = comingSessions(record)
  const outstanding = outstandingHomework(record)
  const overdue = outstanding.filter((h) => h.overdue)
  const missedHomework = record.homework.filter((h) => h.status === 'missed')
  const missedSessions = record.sessions.filter((s) => s.status === 'missed')
  const results = recentResults(record, 3)
  const strong = topicsByStatus(record, 'strong').slice(0, 3)
  const focus = focusTopics(record, 3)
  const feedback = record.feedback[0]
  const stage = profile.configured ? JOURNEY_STAGES[profile.currentStageIndex] : undefined

  const attention = [
    missedSessions.length ? `${missedSessions.length} missed session${missedSessions.length === 1 ? '' : 's'}` : null,
    missedHomework.length
      ? `${missedHomework.length} homework set${missedHomework.length === 1 ? '' : 's'} not submitted`
      : null,
    overdue.length ? `${overdue.length} set${overdue.length === 1 ? '' : 's'} overdue` : null,
  ].filter(Boolean)

  const isEmpty =
    record.sessions.length === 0 &&
    record.homework.length === 0 &&
    record.quizzes.length === 0 &&
    record.mocks.length === 0 &&
    record.feedback.length === 0

  return (
    <div className="space-y-5">
      {preview ? <PreviewNotice audience="parent" /> : null}
      <ChildSwitcher base={base} section="" items={linked} selectedId={profile.id} />

      {/* ---------- Who and where ---------- */}
      <section className="overflow-hidden rounded-panel border border-deep-100 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-mist px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="break-words font-display text-lg font-bold text-deep-700">{profile.name}</h2>
            <p className="mt-0.5 text-sm text-deep-500">
              {stage
                ? `${profile.programTitle ?? 'Programme'} · Stage ${profile.currentStageIndex + 1} of ${JOURNEY_STAGES.length} — ${stage.title}`
                : 'Programme being set up after the first assessment'}
            </p>
          </div>
          {profile.exam || profile.level ? (
            <div className="flex flex-wrap items-center gap-2">
              {profile.exam ? <Badge tone={profile.exam === 'SAT' ? 'sky' : 'olive'}>{profile.exam}</Badge> : null}
              {profile.level ? <Badge tone="neutral">{profile.level}</Badge> : null}
            </div>
          ) : null}
        </header>

        {attention.length ? (
          <div className="flex items-start gap-3 border-t border-alert-100 bg-alert-50/60 px-5 py-3.5 sm:px-6">
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
            <p className="text-sm leading-relaxed text-alert-800">
              <strong className="font-semibold">Needs attention:</strong> {attention.join(' · ')}.
            </p>
          </div>
        ) : null}
      </section>

      {isEmpty ? (
        <EmptyPanel title={`Nothing recorded for ${profile.name} yet`}>
          Sessions, homework, results and written feedback appear here as Mr. Desouky records them.
          Nothing on this page is estimated.
        </EmptyPanel>
      ) : (
        <>
          {attendance.held > 0 || homework.due > 0 || record.quizzes.length > 0 || mock ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {attendance.held > 0 ? (
                <StatTile
                  label="Attendance"
                  index={0}
                  countTo={attendance.rate}
                  countSuffix="%"
                  value={`${attendance.rate}%`}
                  hint={`${attendance.attended} of ${attendance.held} sessions`}
                  tone={attendance.rate >= 80 ? 'growth' : 'alert'}
                />
              ) : null}
              {homework.due > 0 ? (
                <StatTile
                  label="Homework"
                  index={1}
                  countTo={homework.rate}
                  countSuffix="%"
                  value={`${homework.rate}%`}
                  hint={`${homework.done} of ${homework.due} handed in`}
                  tone={homework.rate >= 80 ? 'growth' : 'alert'}
                />
              ) : null}
              {record.quizzes.length > 0 ? (
                <StatTile
                  label="Quiz average"
                  index={2}
                  countTo={quizAverage(record)}
                  countSuffix="%"
                  value={`${quizAverage(record)}%`}
                  hint={`${record.quizzes.length} quiz${record.quizzes.length === 1 ? '' : 'zes'}`}
                  tone={quizAverage(record) >= 75 ? 'growth' : 'neutral'}
                />
              ) : null}
              {mock ? (
                <StatTile
                  label="Latest mock"
                  index={3}
                  countTo={mock.score}
                  value={mock.score}
                  unit={`/ ${mock.total}`}
                  hint={trend !== null ? `${trend >= 0 ? '+' : ''}${trend} vs previous` : 'First mock'}
                  tone={trend !== null && trend > 0 ? 'growth' : 'neutral'}
                />
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Panel title="Next session">
                <NextSessionCard session={coming[0]} bare />
                {coming.length > 1 ? (
                  <div className="mt-5 border-t border-deep-100 pt-4">
                    <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">After that</p>
                    <SessionList sessions={coming.slice(1, 3)} empty="" />
                  </div>
                ) : null}
              </Panel>
            </div>
            <div className="lg:col-span-7">
              <Panel
                title="Homework to hand in"
                description={outstanding.length ? 'Overdue first, then by due date' : 'Everything set so far is handed in'}
              >
                <HomeworkList items={outstanding} limit={3} />
              </Panel>
            </div>

            <div className="lg:col-span-7">
              <Panel title="Strengths & weaknesses" description="Measured across quiz results, topic by topic">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="mb-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-growth-600">Secure</p>
                    <TopicBars topics={strong} empty="Appears after the first quizzes." />
                  </div>
                  <div>
                    <p className="mb-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-sky-700">Being worked on</p>
                    <TopicBars topics={focus} empty="Nothing flagged yet." />
                  </div>
                </div>
              </Panel>
            </div>
            <div className="lg:col-span-5">
              <Panel title="Recent results">
                <ResultsList results={results} />
              </Panel>
            </div>

            <div className="lg:col-span-12">
              <Panel
                title="Latest feedback"
                description={feedback ? `${feedback.source} · ${formatLongDate(feedback.date)}` : undefined}
              >
                {feedback ? <FeedbackBody note={feedback} /> : <p className="text-sm text-deep-400">No written feedback yet.</p>}
              </Panel>
            </div>
          </div>

          <SectionLink href={childHref(base, 'reports', profile.id)}>
            See full reports for {profile.name}
          </SectionLink>
        </>
      )}

      <Panel title="Questions about progress?" description="Advising is part of every programme">
        <p className="text-sm leading-relaxed text-deep-500">
          If anything here is unclear — a dip, a level decision, or how the exam timeline is looking —
          message directly rather than waiting for the next report.
        </p>
        <div className="mt-4">
          <SectionLink href="/contact">Contact Mr. Desouky</SectionLink>
        </div>
      </Panel>
    </div>
  )
}
