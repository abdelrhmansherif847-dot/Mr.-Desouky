import { PreviewNotice } from '@/components/portal/PreviewNotice'
import type { StudentPageProps } from '@/components/portal/pages/props'
import { EmptyPanel, Panel, StatTile } from '@/components/portal/widgets'
import {
  AchievementGrid,
  FeedbackBody,
  HomeworkList,
  NextActionCard,
  NextSessionCard,
  PanelLink,
  ResultsList,
  SectionLink,
  SessionList,
  TopicBars,
} from '@/components/portal/desk'
import { ProgressRing } from '@/components/ui/Progress'
import {
  attendanceRate,
  comingSessions,
  focusTopics,
  homeworkRate,
  latestMock,
  mockTrend,
  nextAction,
  outstandingHomework,
  quizAverage,
  recentResults,
  topicsByStatus,
  upcomingAssessments,
} from '@/lib/portal/insights'
import { JOURNEY_STAGES } from '@/content/journey'
import { formatLongDate } from '@/lib/utils'

/**
 * The student's desk.
 *
 * One screen that answers, in order: what do I do next, when is my next
 * session, what is outstanding, what is coming up, how am I doing, where are
 * the marks I am losing, and what did Mr. Desouky last say. Every block reads
 * the record it is given and says plainly when there is nothing there yet.
 *
 * Shared by the real portal (/student) and the preview (/preview/student);
 * links are built from `base` so neither ever sends a visitor to the other.
 */
export default function StudentOverviewPage({ base, record, preview }: StudentPageProps) {
  const { profile } = record
  const action = nextAction(record)
  const coming = comingSessions(record)
  const outstanding = outstandingHomework(record)
  const assessments = upcomingAssessments(record).slice(0, 3)
  const results = recentResults(record, 4)
  const focus = focusTopics(record, 4)
  const strong = topicsByStatus(record, 'strong').slice(0, 4)
  const feedback = record.feedback[0]

  const attendance = attendanceRate(record)
  const homework = homeworkRate(record)
  const mock = latestMock(record)
  const trend = mockTrend(record)
  const hasPerformance = attendance.held > 0 || homework.due > 0 || record.quizzes.length > 0 || Boolean(mock)

  const isEmpty =
    record.sessions.length === 0 &&
    record.homework.length === 0 &&
    record.quizzes.length === 0 &&
    record.mocks.length === 0 &&
    record.feedback.length === 0 &&
    record.achievements.length === 0

  const stage = profile.configured ? JOURNEY_STAGES[profile.currentStageIndex] : undefined

  return (
    <div className="space-y-5">
      {preview ? <PreviewNotice audience="student" /> : null}

      {!profile.configured ? (
        <div className="rounded-card border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-sm leading-relaxed text-deep-600 sm:px-5">
          <strong className="font-semibold text-deep-700">Your programme is being set up.</strong>{' '}
          Mr. Desouky adds your exam, level and journey stage after your first assessment. Anything
          already recorded for you shows below.
        </div>
      ) : null}

      {isEmpty ? (
        <EmptyPanel title="Your desk is ready" icon="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z">
          Sessions, homework, quiz and mock results, and written feedback appear here as soon as Mr.
          Desouky records them. Nothing here is estimated — every number on this page will come from
          your own work.
        </EmptyPanel>
      ) : (
        <>
          {/* ---------- Now: the next step and the next session ---------- */}
          <section
            aria-label="What is next"
            className="grid overflow-hidden rounded-panel border border-deep-100 bg-white md:grid-cols-2"
          >
            <div className="p-5 sm:p-6 lg:p-7">
              <NextActionCard
                action={action}
                href={action ? `${base}${action.section ? `/${action.section}` : ''}` : `${base}/homework`}
              />
            </div>
            <div className="border-t border-deep-100 bg-mist/60 p-5 sm:p-6 md:border-l md:border-t-0 lg:p-7">
              <NextSessionCard session={coming[0]} />
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-12">
            {/* ---------- Outstanding homework ---------- */}
            <div className="lg:col-span-7">
              <Panel
                title="Outstanding homework"
                description={
                  outstanding.length
                    ? `${outstanding.length} set${outstanding.length === 1 ? '' : 's'} to hand in`
                    : 'Everything set so far is handed in'
                }
                action={<PanelLink href={`${base}/homework`}>All homework</PanelLink>}
              >
                <HomeworkList items={outstanding} />
              </Panel>
            </div>

            {/* ---------- Coming up: quizzes and mocks on the calendar ---------- */}
            <div className="lg:col-span-5">
              <Panel
                title="Coming up"
                description="Quizzes and mocks on the calendar"
                action={<PanelLink href={`${base}/sessions`}>Calendar</PanelLink>}
              >
                <SessionList
                  sessions={assessments.length ? assessments : coming.slice(1, 3)}
                  empty="No quiz or mock is scheduled yet."
                />
                {!assessments.length && coming.length > 1 ? (
                  <p className="mt-3 text-xs text-deep-400">No quiz or mock yet — these are your next sessions.</p>
                ) : null}
              </Panel>
            </div>
          </div>

          {/* ---------- How it is going — only numbers that exist ---------- */}
          {hasPerformance ? (
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
                  hint={`Across ${record.quizzes.length} quiz${record.quizzes.length === 1 ? '' : 'zes'}`}
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
                  hint={trend !== null ? `${trend >= 0 ? '+' : ''}${trend} vs previous mock` : 'First mock'}
                  tone={trend !== null && trend > 0 ? 'growth' : 'neutral'}
                />
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-12">
            {/* ---------- Recent results ---------- */}
            <div className="lg:col-span-7">
              <Panel
                title="Recent results"
                description="Latest quizzes and mocks, newest first"
                action={<PanelLink href={`${base}/quizzes`}>Reviews</PanelLink>}
              >
                <ResultsList results={results} />
              </Panel>
            </div>

            {/* ---------- Journey ---------- */}
            <div className="lg:col-span-5">
              <Panel title="Your journey" description={stage ? `Stage ${profile.currentStageIndex + 1} of ${JOURNEY_STAGES.length}` : 'Not started yet'}>
                {stage ? (
                  <div className="flex items-center gap-5">
                    <ProgressRing
                      value={Math.round(((profile.currentStageIndex + 1) / JOURNEY_STAGES.length) * 100)}
                      sublabel="journey"
                      size={96}
                    />
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold text-deep-700">{stage.title}</p>
                      <p className="mt-0.5 text-sm text-sky-600">{stage.tagline}</p>
                      {profile.targetExamDate ? (
                        <p className="mt-2 text-xs text-deep-400">Exam: {formatLongDate(profile.targetExamDate)}</p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-deep-500">
                    Your stage is set after the first assessment. Seven stages take you from a diagnostic
                    to exam day.
                  </p>
                )}
                <div className="mt-4">
                  <SectionLink href={`${base}/journey`}>See the full journey</SectionLink>
                </div>
              </Panel>
            </div>

            {/* ---------- Where the marks are ---------- */}
            <div className="lg:col-span-6">
              <Panel title="Needs work" description="Where the next marks are — study time goes here">
                <TopicBars topics={focus} empty="No weak areas measured yet. They appear after your first quiz." />
              </Panel>
            </div>
            <div className="lg:col-span-6">
              <Panel title="Strengths" description="Secure topics — no extra time needed">
                <TopicBars topics={strong} empty="Strengths appear once quiz results are recorded." />
              </Panel>
            </div>

            {/* ---------- Latest feedback ---------- */}
            <div className={record.achievements.length ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <Panel
                title="Latest feedback"
                description={feedback ? `${feedback.source} · ${formatLongDate(feedback.date)}` : undefined}
              >
                {feedback ? (
                  <FeedbackBody note={feedback} compact={Boolean(record.achievements.length)} />
                ) : (
                  <p className="text-sm text-deep-400">No written feedback yet.</p>
                )}
              </Panel>
            </div>

            {/* ---------- Achievements ---------- */}
            {record.achievements.length ? (
              <div className="lg:col-span-5">
                <Panel title="Achievements" description="Earned through consistency, not participation">
                  <AchievementGrid items={record.achievements.slice(0, 3)} stacked />
                </Panel>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
