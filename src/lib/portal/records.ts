import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getViewer } from './auth'
import type {
  ChildSummary,
  FeedbackNote,
  HomeworkRecord,
  HomeworkStatus,
  MockRecord,
  QuizRecord,
  ReviewRecord,
  SessionRecord,
  SessionStatus,
  StudentProfile,
  StudentRecord,
} from './types'
import { deriveTopics } from './insights'

/**
 * REAL RECORDS — for /student and /parent
 * =======================================
 * Every query runs as the signed-in user through their own session, so the
 * database's row-level security is the final word on what comes back
 * (migrations 0006 and 0007): a student sees their own rows, a parent their
 * linked children's, nobody else anything. The checks in this file are a
 * second line, not the only one.
 *
 * Nothing here invents a value. A student Mr. Desouky has not set up yet gets
 * `configured: false` and empty lists, and the pages say so.
 *
 * Database errors are never shown to users: they are reported once on the
 * server and surface as a generic "could not load" state.
 */

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>

export class RecordsUnavailableError extends Error {
  constructor() {
    super('Records are temporarily unavailable.')
  }
}

function fail(context: string, error: unknown): never {
  // Server log only — the message never reaches the page.
  console.error(`[portal records] ${context}:`, error)
  throw new RecordsUnavailableError()
}

const SESSION_STATUS: Record<string, SessionStatus> = {
  scheduled: 'upcoming',
  attended: 'attended',
  missed: 'missed',
  cancelled: 'cancelled',
}

const HOMEWORK_STATUS: Record<string, HomeworkStatus> = {
  assigned: 'pending',
  completed: 'completed',
  late: 'late',
  missed: 'missed',
}

/**
 * Load one student's whole record. Callers decide *whether* the viewer may
 * ask for this student; RLS decides what the database actually returns.
 */
export async function loadStudentRecord(
  supabase: Supabase,
  studentId: string,
  name: string,
): Promise<StudentRecord> {
  const [profile, sessions, homework, quizzes, reviews, mocks, feedback, achievements] = await Promise.all([
    supabase
      .from('student_profiles')
      .select('exam, level, program_title, started_on, current_stage, target_exam_date')
      .eq('student_id', studentId)
      .maybeSingle(),
    supabase
      .from('sessions')
      .select('id, session_date, start_time, kind, topic, status, preparation, notes')
      .eq('student_id', studentId)
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true }),
    supabase
      .from('homework')
      .select('id, title, description, topic, assigned_on, due_on, status, progress, score, feedback')
      .eq('student_id', studentId)
      .order('due_on', { ascending: true }),
    supabase
      .from('quizzes')
      .select('id, title, taken_on, score, total')
      .eq('student_id', studentId)
      .order('taken_on', { ascending: true }),
    supabase
      .from('reviews')
      .select('id, quiz_id, title, reviewed_on, content, next_step')
      .eq('student_id', studentId)
      .order('reviewed_on', { ascending: false }),
    supabase
      .from('mocks')
      .select('id, exam, title, taken_on, score, total, notes')
      .eq('student_id', studentId)
      .order('taken_on', { ascending: true }),
    supabase
      .from('feedback')
      .select('id, category, message, next_step, given_on')
      .eq('student_id', studentId)
      .order('given_on', { ascending: false }),
    supabase
      .from('achievements')
      .select('id, title, description, earned_on, kind')
      .eq('student_id', studentId)
      .order('earned_on', { ascending: false }),
  ])

  for (const [label, result] of Object.entries({
    profile, sessions, homework, quizzes, reviews, mocks, feedback, achievements,
  })) {
    if (result.error) fail(label, result.error)
  }

  const quizIds = (quizzes.data ?? []).map((q) => q.id as string)
  const mockIds = (mocks.data ?? []).map((m) => m.id as string)

  const [topicRows, sectionRows] = await Promise.all([
    quizIds.length
      ? supabase.from('quiz_topic_results').select('quiz_id, topic, correct, total').in('quiz_id', quizIds)
      : Promise.resolve({ data: [], error: null }),
    mockIds.length
      ? supabase
          .from('mock_sections')
          .select('mock_id, name, correct, total, minutes_used, minutes_allowed, position')
          .in('mock_id', mockIds)
          .order('position', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ])
  if (topicRows.error) fail('quiz topics', topicRows.error)
  if (sectionRows.error) fail('mock sections', sectionRows.error)

  const topicsByQuiz = new Map<string, { name: string; correct: number; total: number }[]>()
  for (const row of topicRows.data ?? []) {
    const list = topicsByQuiz.get(row.quiz_id) ?? []
    list.push({ name: row.topic, correct: row.correct, total: row.total })
    topicsByQuiz.set(row.quiz_id, list)
  }
  const sectionsByMock = new Map<string, MockRecord['modules']>()
  for (const row of sectionRows.data ?? []) {
    const list = sectionsByMock.get(row.mock_id) ?? []
    list.push({
      name: row.name,
      correct: row.correct,
      total: row.total,
      minutesUsed: row.minutes_used ?? undefined,
      minutesAllowed: row.minutes_allowed ?? undefined,
    })
    sectionsByMock.set(row.mock_id, list)
  }

  const p = profile.data
  const studentProfile: StudentProfile = {
    id: studentId,
    name,
    programTitle: p?.program_title ?? null,
    exam: p?.exam ?? null,
    level: p?.level ?? null,
    startedOn: p?.started_on ?? null,
    currentStageIndex: p?.current_stage ?? 0,
    targetExamDate: p?.target_exam_date ?? null,
    configured: Boolean(p),
  }

  return {
    profile: studentProfile,
    sessions: (sessions.data ?? []).map(
      (row): SessionRecord => ({
        id: row.id,
        date: row.session_date,
        time: row.start_time ? String(row.start_time).slice(0, 5) : '',
        topic: row.topic,
        stage: row.kind,
        status: SESSION_STATUS[row.status] ?? 'upcoming',
        prepare: row.preparation ?? undefined,
        notes: row.notes ?? undefined,
      }),
    ),
    homework: (homework.data ?? []).map(
      (row): HomeworkRecord => ({
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        topic: row.topic ?? 'General',
        setOn: row.assigned_on,
        dueOn: row.due_on,
        status: HOMEWORK_STATUS[row.status] ?? 'pending',
        progress: row.progress ?? undefined,
        score: row.score === null || row.score === undefined ? undefined : Number(row.score),
        note: row.feedback ?? undefined,
      }),
    ),
    quizzes: (quizzes.data ?? []).map(
      (row): QuizRecord => ({
        id: row.id,
        title: row.title,
        date: row.taken_on,
        score: row.score,
        total: row.total,
        topics: topicsByQuiz.get(row.id) ?? [],
      }),
    ),
    reviews: (reviews.data ?? []).map(
      (row): ReviewRecord => ({
        id: row.id,
        quizId: row.quiz_id ?? undefined,
        title: row.title,
        date: row.reviewed_on,
        summary: row.content,
        causes: [],
        next: row.next_step ?? '',
      }),
    ),
    mocks: (mocks.data ?? []).map(
      (row): MockRecord => ({
        id: row.id,
        label: row.title,
        exam: row.exam,
        date: row.taken_on,
        score: row.score,
        total: row.total,
        modules: sectionsByMock.get(row.id) ?? [],
        note: row.notes ?? '',
      }),
    ),
    topics: deriveTopics(
      (topicRows.data ?? []).map((row) => ({ topic: row.topic, correct: row.correct, total: row.total })),
    ),
    achievements: (achievements.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      earnedOn: row.earned_on,
      kind: row.kind,
    })),
    feedback: (feedback.data ?? []).map(
      (row): FeedbackNote => ({
        id: row.id,
        date: row.given_on,
        source: row.category,
        what: row.message,
        next: row.next_step ?? undefined,
      }),
    ),
  }
}

async function client(): Promise<Supabase> {
  const supabase = await createClient()
  if (!supabase) throw new RecordsUnavailableError()
  return supabase
}

/**
 * The signed-in student's own record. The id comes from the verified
 * session (getViewer), never from the request. Cached per request so the
 * layout and the page share one load.
 */
export const getMyStudentRecord = cache(async (): Promise<StudentRecord | null> => {
  const viewer = await getViewer()
  if (viewer?.kind !== 'student') return null
  return loadStudentRecord(await client(), viewer.id, viewer.name || 'Student')
})

/**
 * The signed-in parent's linked children — identity only. Resolved from the
 * parent's own guardianships in the database (linked_students), so it can
 * never include a student who is not linked to this parent.
 */
export const getMyChildren = cache(async (): Promise<ChildSummary[]> => {
  const viewer = await getViewer()
  if (viewer?.kind !== 'parent') return []
  const supabase = await client()
  const { data, error } = await supabase.rpc('linked_students')
  if (error) fail('linked students', error)
  return ((data ?? []) as { id: string; full_name: string | null }[]).map((row) => ({
    id: row.id,
    name: row.full_name?.trim() || 'Your student',
  }))
})

/**
 * Which child a parent is looking at, and that child's record.
 *
 * `requested` comes from the URL and is only ever a *selection*: it is
 * honoured only if it is one of this parent's own linked children. Anything
 * else — an unlinked student's id, garbage, nothing — is treated as no
 * selection. With exactly one child that child is chosen automatically; with
 * several and no valid selection, the caller shows the chooser.
 */
export const getChildView = cache(
  async (
    requested: string | undefined,
  ): Promise<{ children: ChildSummary[]; selected: ChildSummary | null; record: StudentRecord | null }> => {
    const children = await getMyChildren()
    const selected =
      children.find((child) => child.id === requested) ?? (children.length === 1 ? children[0] : null)
    if (!selected) return { children, selected: null, record: null }
    const record = await loadStudentRecord(await client(), selected.id, selected.name)
    return { children, selected, record }
  },
)

/**
 * For /student pages: the signed-in student's record, or the login page.
 * The layout has already refused anyone else; this keeps each page safe on
 * its own.
 */
export async function requireMyStudentRecord(): Promise<StudentRecord> {
  const record = await getMyStudentRecord()
  if (!record) redirect('/login/student')
  return record
}
