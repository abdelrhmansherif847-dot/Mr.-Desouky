import { cache } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cairoToday } from '@/lib/portal/insights'
import { getOwnerSession, type OwnerSession } from './auth'
import type { Account, AccountStatus, Role } from './accounts'

export { filterAccounts, type Account, type AccountFilter, type Role } from './accounts'

/**
 * ADMIN DATA — owner only
 * =======================
 * Every query runs with the owner's own session. There is no service-role
 * key anywhere in this codebase: the owner reads everything because the
 * database's policies say the owner may (private.is_owner()), and writes go
 * through the same policies or the owner-checked functions in 0006.
 *
 * requireOwner() is the server-side gate for every admin page and action. It
 * answers 404 — never 403 — so a non-owner learns nothing, matching
 * middleware.ts, which has already refused them once.
 *
 * Database errors are logged here and replaced by AdminDataError, whose
 * message is generic; nothing from Postgres reaches a page.
 */

export class AdminDataError extends Error {
  constructor() {
    super('Admin data is temporarily unavailable.')
  }
}

function fail(context: string, error: unknown): never {
  console.error(`[admin data] ${context}:`, error)
  throw new AdminDataError()
}

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>

/** The signed-in owner, or a 404 for everyone else. */
export const requireOwner = cache(async (): Promise<OwnerSession> => {
  const owner = await getOwnerSession()
  if (!owner) notFound()
  return owner
})

async function db(): Promise<Supabase> {
  await requireOwner()
  const supabase = await createClient()
  if (!supabase) notFound()
  return supabase
}

type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: Role
  status: AccountStatus
  created_at: string
}

const toAccount = (row: ProfileRow): Account => ({
  id: row.id,
  email: row.email,
  name: row.full_name?.trim() || '',
  phone: row.phone,
  role: row.role,
  status: row.status,
  createdAt: row.created_at,
})

/** Every account, newest first. Small enough to hold whole and filter here. */
export const getAccounts = cache(async (): Promise<Account[]> => {
  const supabase = await db()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, role, status, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)
  if (error) fail('profiles', error)
  return (data as ProfileRow[]).map(toAccount)
})

export type Link = { parentId: string; studentId: string; createdAt: string }

export const getLinks = cache(async (): Promise<Link[]> => {
  const supabase = await db()
  const { data, error } = await supabase.from('guardianships').select('parent_id, student_id, created_at')
  if (error) fail('guardianships', error)
  return (data ?? []).map((row) => ({ parentId: row.parent_id, studentId: row.student_id, createdAt: row.created_at }))
})

/* ------------------------------ dashboard ------------------------------ */

export type Activity = { id: string; what: string; detail: string; at: string; href: string }

export type Dashboard = {
  pending: number
  activeStudents: number
  activeParents: number
  upcomingSessions: number
  homeworkToReview: number
  staleSessions: number
  recentAccounts: Account[]
  recentActivity: Activity[]
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function getDashboard(): Promise<Dashboard> {
  const supabase = await db()
  const today = cairoToday()
  const [accounts, upcoming, toReview, stale, sessions, homework, quizzes, mocks, feedback] = await Promise.all([
    getAccounts(),
    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('session_date', today)
      .lte('session_date', addDays(today, 7)),
    // Past its due date and still marked assigned: it needs marking or chasing.
    supabase
      .from('homework')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'assigned')
      .lt('due_on', today),
    // Scheduled in the past and never marked attended or missed.
    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .lt('session_date', today),
    supabase.from('sessions').select('id, student_id, topic, updated_at').order('updated_at', { ascending: false }).limit(5),
    supabase.from('homework').select('id, student_id, title, updated_at').order('updated_at', { ascending: false }).limit(5),
    supabase.from('quizzes').select('id, student_id, title, updated_at').order('updated_at', { ascending: false }).limit(5),
    supabase.from('mocks').select('id, student_id, title, updated_at').order('updated_at', { ascending: false }).limit(5),
    supabase.from('feedback').select('id, student_id, category, updated_at').order('updated_at', { ascending: false }).limit(5),
  ])
  for (const [label, result] of Object.entries({ upcoming, toReview, stale, sessions, homework, quizzes, mocks, feedback })) {
    if (result.error) fail(`dashboard ${label}`, result.error)
  }

  const names = new Map(accounts.map((a) => [a.id, a.name || a.email]))
  const activity = (rows: { id: string; student_id: string; updated_at: string }[] | null, what: string, text: (r: never) => string) =>
    (rows ?? []).map((row) => ({
      id: `${what}-${row.id}`,
      what,
      detail: `${names.get(row.student_id) ?? 'Student'} · ${text(row as never)}`,
      at: row.updated_at,
      href: `/admin/students/${row.student_id}`,
    }))

  return {
    pending: accounts.filter((a) => a.status === 'pending').length,
    activeStudents: accounts.filter((a) => a.role === 'student' && a.status === 'approved').length,
    activeParents: accounts.filter((a) => a.role === 'parent' && a.status === 'approved').length,
    upcomingSessions: upcoming.count ?? 0,
    homeworkToReview: toReview.count ?? 0,
    staleSessions: stale.count ?? 0,
    recentAccounts: accounts.slice(0, 5),
    recentActivity: [
      ...activity(sessions.data, 'Session', (r: { topic: string }) => r.topic),
      ...activity(homework.data, 'Homework', (r: { title: string }) => r.title),
      ...activity(quizzes.data, 'Quiz', (r: { title: string }) => r.title),
      ...activity(mocks.data, 'Mock', (r: { title: string }) => r.title),
      ...activity(feedback.data, 'Feedback', (r: { category: string }) => r.category),
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 8),
  }
}

/* ------------------------------ students ------------------------------ */

export type StudentSummary = Account & {
  exam: string | null
  stage: number | null
  configured: boolean
  nextSession: string | null
  parents: number
}

export async function getStudents(): Promise<StudentSummary[]> {
  const supabase = await db()
  const today = cairoToday()
  const [accounts, links, profiles, sessions] = await Promise.all([
    getAccounts(),
    getLinks(),
    supabase.from('student_profiles').select('student_id, exam, current_stage'),
    supabase
      .from('sessions')
      .select('student_id, session_date')
      .eq('status', 'scheduled')
      .gte('session_date', today)
      .order('session_date', { ascending: true }),
  ])
  if (profiles.error) fail('student_profiles', profiles.error)
  if (sessions.error) fail('sessions', sessions.error)

  const setup = new Map((profiles.data ?? []).map((p) => [p.student_id as string, p]))
  const next = new Map<string, string>()
  for (const s of sessions.data ?? []) if (!next.has(s.student_id)) next.set(s.student_id, s.session_date)

  return accounts
    .filter((a) => a.role === 'student')
    .map((a) => ({
      ...a,
      exam: setup.get(a.id)?.exam ?? null,
      stage: setup.get(a.id)?.current_stage ?? null,
      configured: setup.has(a.id),
      nextSession: next.get(a.id) ?? null,
      parents: links.filter((l) => l.studentId === a.id).length,
    }))
}

export type ParentSummary = Account & { children: { id: string; name: string }[] }

export async function getParents(): Promise<ParentSummary[]> {
  const [accounts, links] = await Promise.all([getAccounts(), getLinks()])
  const byId = new Map(accounts.map((a) => [a.id, a]))
  return accounts
    .filter((a) => a.role === 'parent')
    .map((a) => ({
      ...a,
      children: links
        .filter((l) => l.parentId === a.id)
        .map((l) => ({ id: l.studentId, name: byId.get(l.studentId)?.name || byId.get(l.studentId)?.email || 'Student' })),
    }))
}

/* --------------------------- one student's file --------------------------- */

type Row = Record<string, string | number | null>

export type QuizRow = Row & { topics: Row[] }
export type MockRow = Row & { sections: Row[] }

export type StudentFile = {
  account: Account
  profile: Row | null
  parents: Account[]
  sessions: Row[]
  homework: Row[]
  quizzes: QuizRow[]
  reviews: Row[]
  mocks: MockRow[]
  feedback: Row[]
  achievements: Row[]
}

/**
 * Everything recorded for one student, with raw column values for the edit
 * forms. `id` comes from the URL, so it is validated and must name a student
 * account — anything else is a 404.
 */
export async function getStudentFile(id: string): Promise<StudentFile> {
  const supabase = await db()
  const [accounts, links] = await Promise.all([getAccounts(), getLinks()])
  const account = accounts.find((a) => a.id === id && a.role === 'student')
  if (!account) notFound()

  const [profile, sessions, homework, quizzes, reviews, mocks, feedback, achievements] = await Promise.all([
    supabase.from('student_profiles').select('*').eq('student_id', id).maybeSingle(),
    supabase.from('sessions').select('*').eq('student_id', id).order('session_date', { ascending: false }),
    supabase.from('homework').select('*').eq('student_id', id).order('due_on', { ascending: false }),
    supabase.from('quizzes').select('*, quiz_topic_results(*)').eq('student_id', id).order('taken_on', { ascending: false }),
    supabase.from('reviews').select('*').eq('student_id', id).order('reviewed_on', { ascending: false }),
    supabase.from('mocks').select('*, mock_sections(*)').eq('student_id', id).order('taken_on', { ascending: false }),
    supabase.from('feedback').select('*').eq('student_id', id).order('given_on', { ascending: false }),
    supabase.from('achievements').select('*').eq('student_id', id).order('earned_on', { ascending: false }),
  ])
  for (const [label, result] of Object.entries({ profile, sessions, homework, quizzes, reviews, mocks, feedback, achievements })) {
    if (result.error) fail(`student file ${label}`, result.error)
  }

  const parentIds = new Set(links.filter((l) => l.studentId === id).map((l) => l.parentId))
  return {
    account,
    profile: (profile.data as Row | null) ?? null,
    parents: accounts.filter((a) => parentIds.has(a.id)),
    sessions: (sessions.data ?? []) as Row[],
    homework: (homework.data ?? []) as Row[],
    quizzes: ((quizzes.data ?? []) as Record<string, unknown>[]).map(({ quiz_topic_results, ...q }) =>
      Object.assign(q as Row, { topics: (quiz_topic_results as Row[] | null) ?? [] }) as QuizRow,
    ),
    reviews: (reviews.data ?? []) as Row[],
    mocks: ((mocks.data ?? []) as Record<string, unknown>[]).map(({ mock_sections, ...m }) =>
      Object.assign(m as Row, {
        sections: ((mock_sections as Row[] | null) ?? []).slice().sort((a, b) => Number(a.position) - Number(b.position)),
      }) as MockRow,
    ),
    feedback: (feedback.data ?? []) as Row[],
    achievements: (achievements.data ?? []) as Row[],
  }
}
