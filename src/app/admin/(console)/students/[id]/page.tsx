import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { AccountActions, DeleteRecord, LinkForm, RecordForm, UnlinkButton } from '@/components/admin/forms'
import { OwnerBar } from '@/components/admin/OwnerBar'
import { Empty, RoleBadge, Section, StatusBadge } from '@/components/admin/ui'
import { getParents, getStudentFile } from '@/lib/admin/data'
import { isUuid, type RecordKind } from '@/lib/admin/forms'
import { formatLongDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Row = Record<string, string | number | null>

const SECTIONS = [
  ['programme', 'Programme'],
  ['parents', 'Parents'],
  ['sessions', 'Sessions'],
  ['homework', 'Homework'],
  ['quizzes', 'Quizzes'],
  ['reviews', 'Reviews'],
  ['mocks', 'Mocks'],
  ['feedback', 'Feedback'],
  ['achievements', 'Achievements'],
] as const

const VISIBILITY_LABEL: Record<string, string> = {
  shared: 'Student + parents',
  student: 'Student only',
  parent: 'Parents only',
  internal: 'Internal',
}

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'sky' | 'growth' | 'alert' | 'olive' }) {
  const cls = {
    neutral: 'bg-mist text-deep-600 ring-deep-200/60',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/70',
    growth: 'bg-growth-50 text-growth-700 ring-growth-200/70',
    alert: 'bg-alert-50 text-alert-700 ring-alert-200/70',
    olive: 'bg-olive-50 text-olive-700 ring-olive-200/70',
  }[tone]
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.1em] ring-1 ring-inset', cls)}>
      {children}
    </span>
  )
}

const STATUS_TONE: Record<string, 'neutral' | 'sky' | 'growth' | 'alert' | 'olive'> = {
  scheduled: 'sky', attended: 'growth', missed: 'alert', cancelled: 'neutral',
  assigned: 'sky', completed: 'growth', late: 'olive',
  draft: 'neutral', published: 'growth',
  shared: 'sky', student: 'neutral', parent: 'neutral', internal: 'olive',
}

/** Add form, collapsed until needed so the page reads as a record first. */
function AddRecord({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group mt-4 rounded-card border border-dashed border-deep-200 open:border-solid open:bg-mist/40">
      <summary className="flex min-h-[2.75rem] cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 hover:text-sky-800 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="text-base leading-none transition-transform duration-200 group-open:rotate-45">+</span>
        {label}
      </summary>
      <div className="border-t border-deep-100 px-4 py-4">{children}</div>
    </details>
  )
}

/** One saved record: a summary line, then edit and delete on demand. */
function RecordRow({
  kind,
  student,
  row,
  parent,
  noun,
  summary,
  children,
  refOptions,
}: {
  kind: RecordKind
  student: string
  row: Row
  parent?: string
  noun: string
  summary: React.ReactNode
  children?: React.ReactNode
  refOptions?: { value: string; label: string }[]
}) {
  const id = String(row.id)
  const label = String(row.title ?? row.topic ?? row.category ?? row.name ?? noun)
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">{summary}</div>
        <DeleteRecord kind={kind} student={student} id={id} parent={parent} noun={noun} label={label} />
      </div>
      <details className="mt-1.5">
        <summary
          aria-label={`Edit ${noun}: ${label}`}
          className="inline-flex min-h-[2rem] cursor-pointer items-center text-xs font-semibold text-sky-700 hover:text-sky-800"
        >
          Edit
        </summary>
        <div className="mt-3 rounded-card bg-mist/60 p-4">
          <RecordForm
            kind={kind}
            student={student}
            parent={parent}
            id={id}
            initial={row}
            submitLabel="Save changes"
            refOptions={refOptions}
          />
        </div>
      </details>
      {children}
    </li>
  )
}

function Title({ children }: { children: React.ReactNode }) {
  return <p className="break-words font-display text-sm font-bold text-deep-700">{children}</p>
}
function Meta({ children }: { children: React.ReactNode }) {
  return <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-deep-500">{children}</p>
}

/**
 * Everything recorded for one student, and the forms to change it. The id
 * in the URL only chooses which file to open: it must be a UUID naming a
 * student account (else 404), and every write re-checks the owner and the
 * student server-side and in the database.
 */
export default async function AdminStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()
  const [file, parents] = await Promise.all([getStudentFile(id), getParents()])
  const { account } = file
  const student = account.id

  const linkedIds = new Set(file.parents.map((p) => p.id))
  const parentChoices = parents
    .filter((p) => !linkedIds.has(p.id) && p.status !== 'suspended')
    .map((p) => ({ value: p.id, label: `${p.name || p.email}${p.status === 'pending' ? ' (pending)' : ''}` }))
  const quizOptions = file.quizzes.map((q) => ({ value: String(q.id), label: `${q.title} — ${formatLongDate(String(q.taken_on))}` }))

  return (
    <AdminShell title={account.name || account.email} subtitle="Student file" actions={<OwnerBar />}>
      <div className="space-y-5">
        <Link href="/admin/students" className="inline-flex py-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
          ← All students
        </Link>

        {/* Identity and account */}
        <section className="grid gap-4 rounded-panel border border-deep-100 bg-white p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={account.role} />
              <StatusBadge status={account.status} />
            </div>
            <p className="mt-2 break-all text-sm text-deep-600">{account.email}</p>
            {account.phone ? <p className="text-sm text-deep-500">{account.phone}</p> : null}
            {account.status !== 'approved' ? (
              <p className="mt-2 text-xs text-deep-400">
                This student cannot see their portal until the account is approved.
              </p>
            ) : null}
          </div>
          <AccountActions target={student} status={account.status} role={account.role} name={account.name || account.email} compact />
        </section>

        {/* In-page navigation — a scrolling row, never a sidebar */}
        <nav aria-label="Student file sections" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <ul className="flex min-w-max gap-2">
            {SECTIONS.map(([anchor, label]) => (
              <li key={anchor}>
                <a
                  href={`#${anchor}`}
                  className="inline-flex min-h-[2.25rem] items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-deep-600 ring-1 ring-inset ring-deep-200 hover:bg-mist hover:text-deep-800"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Section id="programme" title="Programme" description="Exam, level and journey stage — the portal header and journey read these.">
          <RecordForm
            kind="student_profiles"
            student={student}
            initial={file.profile ?? undefined}
            submitLabel={file.profile ? 'Save programme' : 'Set up programme'}
          />
        </Section>

        <Section id="parents" title="Parents" description="Linked parents see this student's shared records.">
          {file.parents.length ? (
            <ul className="mb-4 divide-y divide-deep-100">
              {file.parents.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-deep-700">{p.name || p.email}</p>
                    <p className="break-all text-xs text-deep-500">{p.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <UnlinkButton parent={p.id} student={student} label={`Unlink ${p.name || p.email}`} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-deep-400">No parent linked yet.</p>
          )}
          <LinkForm fixed="student" fixedId={student} choices={parentChoices} />
        </Section>

        <Section id="sessions" title={`Sessions (${file.sessions.length})`} description="Newest first. Mark each one attended, missed or cancelled after it happens.">
          {file.sessions.length ? (
            <ul className="divide-y divide-deep-100">
              {file.sessions.map((s) => (
                <RecordRow
                  key={String(s.id)}
                  kind="sessions"
                  student={student}
                  row={s}
                  noun="session"
                  summary={
                    <>
                      <Title>{s.topic}</Title>
                      <Meta>
                        {formatLongDate(String(s.session_date))}
                        {s.start_time ? ` · ${String(s.start_time).slice(0, 5)}` : ''} · {s.kind} · {s.duration_minutes} min
                        <Pill tone={STATUS_TONE[String(s.status)]}>{s.status}</Pill>
                      </Meta>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <Empty>No sessions yet.</Empty>
          )}
          <AddRecord label="Add a session">
            <RecordForm kind="sessions" student={student} submitLabel="Add session" />
          </AddRecord>
        </Section>

        <Section id="homework" title={`Homework (${file.homework.length})`} description="Mark as completed, late or missed once the due date passes.">
          {file.homework.length ? (
            <ul className="divide-y divide-deep-100">
              {file.homework.map((h) => (
                <RecordRow
                  key={String(h.id)}
                  kind="homework"
                  student={student}
                  row={h}
                  noun="homework set"
                  summary={
                    <>
                      <Title>{h.title}</Title>
                      <Meta>
                        Due {formatLongDate(String(h.due_on))}
                        {h.topic ? ` · ${h.topic}` : ''}
                        {h.score !== null ? ` · ${Number(h.score)}%` : ''}
                        <Pill tone={STATUS_TONE[String(h.status)]}>{h.status}</Pill>
                      </Meta>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <Empty>No homework yet.</Empty>
          )}
          <AddRecord label="Add homework">
            <RecordForm kind="homework" student={student} submitLabel="Add homework" />
          </AddRecord>
        </Section>

        <Section id="quizzes" title={`Quizzes (${file.quizzes.length})`} description="Topic results feed the student's strengths and weaknesses.">
          {file.quizzes.length ? (
            <ul className="divide-y divide-deep-100">
              {file.quizzes.map((q) => (
                <RecordRow
                  key={String(q.id)}
                  kind="quizzes"
                  student={student}
                  row={q}
                  noun="quiz"
                  summary={
                    <>
                      <Title>{q.title}</Title>
                      <Meta>
                        {formatLongDate(String(q.taken_on))} · {q.score}/{q.total}
                      </Meta>
                    </>
                  }
                >
                  <div className="mt-3 rounded-card border border-deep-100 p-3 sm:p-4">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">Topic results</p>
                    {q.topics.length ? (
                      <ul className="mt-2 divide-y divide-deep-100">
                        {q.topics.map((t) => (
                          <RecordRow
                            key={String(t.id)}
                            kind="quiz_topic_results"
                            student={student}
                            parent={String(q.id)}
                            row={t}
                            noun="topic result"
                            summary={
                              <p className="text-sm text-deep-700">
                                {t.topic} <span className="font-mono text-xs text-deep-500">{t.correct}/{t.total}</span>
                              </p>
                            }
                          />
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-deep-400">No topic breakdown yet.</p>
                    )}
                    <AddRecord label="Add a topic result">
                      <RecordForm kind="quiz_topic_results" student={student} parent={String(q.id)} submitLabel="Add topic" />
                    </AddRecord>
                  </div>
                </RecordRow>
              ))}
            </ul>
          ) : (
            <Empty>No quizzes yet.</Empty>
          )}
          <AddRecord label="Add a quiz">
            <RecordForm kind="quizzes" student={student} submitLabel="Add quiz" />
          </AddRecord>
        </Section>

        <Section id="reviews" title={`Reviews (${file.reviews.length})`} description="Drafts stay private to you until published.">
          {file.reviews.length ? (
            <ul className="divide-y divide-deep-100">
              {file.reviews.map((r) => (
                <RecordRow
                  key={String(r.id)}
                  kind="reviews"
                  student={student}
                  row={r}
                  noun="review"
                  refOptions={quizOptions}
                  summary={
                    <>
                      <Title>{r.title}</Title>
                      <Meta>
                        {formatLongDate(String(r.reviewed_on))}
                        <Pill tone={STATUS_TONE[String(r.status)]}>{r.status}</Pill>
                      </Meta>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <Empty>No reviews yet.</Empty>
          )}
          <AddRecord label="Add a review">
            <RecordForm kind="reviews" student={student} submitLabel="Add review" refOptions={quizOptions} />
          </AddRecord>
        </Section>

        <Section id="mocks" title={`Mock exams (${file.mocks.length})`}>
          {file.mocks.length ? (
            <ul className="divide-y divide-deep-100">
              {file.mocks.map((m) => (
                <RecordRow
                  key={String(m.id)}
                  kind="mocks"
                  student={student}
                  row={m}
                  noun="mock exam"
                  summary={
                    <>
                      <Title>{m.title}</Title>
                      <Meta>
                        {m.exam} · {formatLongDate(String(m.taken_on))} · {m.score}/{m.total}
                      </Meta>
                    </>
                  }
                >
                  <div className="mt-3 rounded-card border border-deep-100 p-3 sm:p-4">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-deep-300">Sections</p>
                    {m.sections.length ? (
                      <ul className="mt-2 divide-y divide-deep-100">
                        {m.sections.map((sec) => (
                          <RecordRow
                            key={String(sec.id)}
                            kind="mock_sections"
                            student={student}
                            parent={String(m.id)}
                            row={sec}
                            noun="section"
                            summary={
                              <p className="text-sm text-deep-700">
                                {sec.name}{' '}
                                <span className="font-mono text-xs text-deep-500">
                                  {sec.correct}/{sec.total}
                                  {sec.minutes_used !== null ? ` · ${sec.minutes_used}${sec.minutes_allowed !== null ? `/${sec.minutes_allowed}` : ''} min` : ''}
                                </span>
                              </p>
                            }
                          />
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-deep-400">No sections yet.</p>
                    )}
                    <AddRecord label="Add a section">
                      <RecordForm kind="mock_sections" student={student} parent={String(m.id)} submitLabel="Add section" />
                    </AddRecord>
                  </div>
                </RecordRow>
              ))}
            </ul>
          ) : (
            <Empty>No mock exams yet.</Empty>
          )}
          <AddRecord label="Add a mock exam">
            <RecordForm kind="mocks" student={student} submitLabel="Add mock" />
          </AddRecord>
        </Section>

        <Section id="feedback" title={`Feedback (${file.feedback.length})`} description="Choose who sees each note. Internal notes are yours alone.">
          {file.feedback.length ? (
            <ul className="divide-y divide-deep-100">
              {file.feedback.map((f) => (
                <RecordRow
                  key={String(f.id)}
                  kind="feedback"
                  student={student}
                  row={f}
                  noun="feedback note"
                  summary={
                    <>
                      <Title>{f.category}</Title>
                      <Meta>
                        {formatLongDate(String(f.given_on))}
                        <Pill tone={STATUS_TONE[String(f.visibility)]}>{VISIBILITY_LABEL[String(f.visibility)]}</Pill>
                      </Meta>
                      <p className="mt-1.5 line-clamp-2 text-sm text-deep-600">{f.message}</p>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <Empty>No feedback yet.</Empty>
          )}
          <AddRecord label="Add feedback">
            <RecordForm kind="feedback" student={student} submitLabel="Add feedback" />
          </AddRecord>
        </Section>

        <Section id="achievements" title={`Achievements (${file.achievements.length})`}>
          {file.achievements.length ? (
            <ul className="divide-y divide-deep-100">
              {file.achievements.map((a) => (
                <RecordRow
                  key={String(a.id)}
                  kind="achievements"
                  student={student}
                  row={a}
                  noun="achievement"
                  summary={
                    <>
                      <Title>{a.title}</Title>
                      <Meta>
                        {a.kind} · {formatLongDate(String(a.earned_on))}
                      </Meta>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <Empty>No achievements yet.</Empty>
          )}
          <AddRecord label="Add an achievement">
            <RecordForm kind="achievements" student={student} submitLabel="Add achievement" />
          </AddRecord>
        </Section>
      </div>
    </AdminShell>
  )
}
