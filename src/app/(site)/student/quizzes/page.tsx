import { PreviewNotice } from '@/components/portal/PreviewNotice'
import { Panel, StatTile } from '@/components/portal/widgets'
import { ProgressBar } from '@/components/ui/Progress'
import { getStudentRecord, quizAverage } from '@/lib/portal/data'
import { formatLongDate, pct } from '@/lib/utils'

export default async function StudentQuizzesPage() {
  const record = await getStudentRecord()
  const average = quizAverage(record)
  const quizzes = [...record.quizzes].reverse()

  return (
    <div className="space-y-5">
      <PreviewNotice audience="student" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Quiz average" value={`${average}%`} tone={average >= 75 ? 'growth' : 'neutral'} />
        <StatTile label="Quizzes taken" value={record.quizzes.length} />
        <StatTile label="Reviews completed" value={record.reviews.length} />
        <StatTile
          label="Topics needing work"
          value={record.topics.filter((t) => t.status === 'weak').length}
          tone="alert"
        />
      </div>

      {quizzes.map((quiz) => {
        const review = record.reviews.find((r) => r.quizId === quiz.id)
        const score = pct(quiz.score, quiz.total)

        return (
          <Panel
            key={quiz.id}
            title={quiz.title}
            description={formatLongDate(quiz.date)}
            action={
              <span className="font-display text-lg font-bold tabular-nums text-deep-700">
                {quiz.score}
                <span className="text-sm font-medium text-deep-400">/{quiz.total}</span>
              </span>
            }
          >
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Topic breakdown */}
              <div className="lg:col-span-5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                  Scored by topic
                </p>
                <ul className="mt-4 space-y-4">
                  {quiz.topics.map((topic) => {
                    const topicPct = pct(topic.correct, topic.total)
                    return (
                      <li key={topic.name}>
                        <ProgressBar
                          label={topic.name}
                          valueLabel={`${topic.correct}/${topic.total}`}
                          value={topicPct}
                          tone={topicPct >= 80 ? 'growth' : topicPct >= 60 ? 'sky' : 'alert'}
                          size="sm"
                        />
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-5 border-t border-deep-100 pt-4 text-xs text-deep-400">
                  Overall {score}% — a quiz exists to produce this breakdown, not the single number.
                </p>
              </div>

              {/* Review */}
              <div className="lg:col-span-7">
                {review ? (
                  <div className="rounded-card bg-mist p-4 sm:p-5">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-growth-600">
                      Review · {formatLongDate(review.date)}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-deep-600">{review.summary}</p>

                    <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                      Errors by cause
                    </p>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {review.causes.map((cause) => (
                        <li
                          key={cause.label}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-deep-600 ring-1 ring-inset ring-deep-100"
                        >
                          {cause.label}
                          <span className="font-mono font-bold text-deep-400">×{cause.count}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50/70 px-3.5 py-3">
                      <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-sky-700">
                        What happens next
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-deep-700">{review.next}</p>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-card border border-dashed border-deep-200 px-4 py-6 text-center text-sm text-deep-400">
                    Review scheduled.
                  </p>
                )}
              </div>
            </div>
          </Panel>
        )
      })}
    </div>
  )
}
