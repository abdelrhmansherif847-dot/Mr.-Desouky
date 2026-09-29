'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getOwnerSession } from './auth'
import {
  RECORDS,
  accountErrorMessage,
  isRecordKind,
  isUuid,
  parseRecord,
  type AccountStatus,
  type Errors,
} from './forms'

/**
 * THE OWNER'S WRITE ACTIONS
 * =========================
 * Each action checks, in order, before anything is written:
 *
 *   1. The caller is the owner (getOwnerSession — verified with the auth
 *      server, then the profile's role). Server actions are public HTTP
 *      endpoints, so this is checked here, not assumed from the page.
 *   2. Every id is a UUID, and every value parses against lib/admin/forms.
 *   3. The write runs with the owner's own session: RLS allows it only for
 *      the owner (0007), and account/link changes go through the owner-
 *      checked functions in 0006. No service-role key exists here.
 *
 * Errors come back as field messages or a generic sentence. A database error
 * is logged on the server and never returned to the browser.
 */

export type ActionState = {
  ok?: string
  error?: string
  fields?: Errors
  /** Increments on success so a form can reset itself. */
  done?: number
  /**
   * What was submitted, echoed back so the form keeps it: React resets a
   * form after its action runs, and a validation error must not cost the
   * owner what they typed.
   */
  values?: Record<string, string>
}

const NOT_ALLOWED: ActionState = { error: 'Only the owner can do that.' }
const FAILED: ActionState = { error: 'That did not save. Try again in a moment.' }

async function ownerClient() {
  const owner = await getOwnerSession()
  if (!owner) return null
  const supabase = await createClient()
  return supabase ? { owner, supabase } : null
}

function text(form: FormData, name: string): string {
  const value = form.get(name)
  return typeof value === 'string' ? value : ''
}

function logFailure(context: string, error: unknown) {
  console.error(`[admin action] ${context}:`, error)
}

function failed(context: string, error: unknown): ActionState {
  logFailure(context, error)
  return FAILED
}

const PARENT_TABLE = { quiz: { table: 'quizzes', fk: 'quiz_id' }, mock: { table: 'mocks', fk: 'mock_id' } } as const

/* ------------------------------ records ------------------------------ */

/**
 * Create or update one academic record. Hidden fields (prefixed so they can
 * never collide with a column name such as sessions.kind): _record, _student,
 * and for an edit `_id`; for a quiz topic or mock section also `_parent` (the
 * quiz or mock id). The student is re-checked against the parent row, so a form
 * cannot attach a result to a different student's quiz.
 */
export async function saveRecord(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await ownerClient()
  if (!ctx) return NOT_ALLOWED
  const { supabase } = ctx

  const kind = text(form, '_record')
  const student = text(form, '_student')
  const id = text(form, '_id')
  const parent = text(form, '_parent')
  if (!isRecordKind(kind) || !isUuid(student) || (id && !isUuid(id))) return FAILED

  const spec = RECORDS[kind]
  const input: Record<string, string> = {}
  for (const field of spec.fields) input[field.name] = text(form, field.name)
  const keep = (state: ActionState): ActionState => ({ ...state, values: input })
  const parsed = parseRecord(kind, input)
  if (!parsed.ok) return keep({ error: 'Check the highlighted fields.', fields: parsed.errors })
  const values = parsed.values

  // A review's quiz must be this student's (the database checks this too).
  if (kind === 'reviews' && values.quiz_id) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', values.quiz_id)
      .eq('student_id', student)
      .maybeSingle()
    if (error) return keep(failed('review quiz', error))
    if (!data) return keep({ error: 'Check the highlighted fields.', fields: { quiz_id: 'Choose one of this student’s quizzes.' } })
  }

  let query
  if (spec.parent === 'student') {
    if (kind === 'student_profiles') {
      query = supabase.from('student_profiles').upsert({ ...values, student_id: student }, { onConflict: 'student_id' }).select('student_id')
    } else if (id) {
      query = supabase.from(spec.table).update(values).eq('id', id).eq('student_id', student).select('id')
    } else {
      query = supabase.from(spec.table).insert({ ...values, student_id: student }).select('id')
    }
  } else {
    if (!isUuid(parent)) return FAILED
    const link = PARENT_TABLE[spec.parent]
    const { data: owned, error: ownedError } = await supabase
      .from(link.table)
      .select('id')
      .eq('id', parent)
      .eq('student_id', student)
      .maybeSingle()
    if (ownedError) return keep(failed(`${kind} parent`, ownedError))
    if (!owned) return FAILED
    const row: Record<string, string | number | null> = id ? values : { ...values, [link.fk]: parent }
    query = id
      ? supabase.from(spec.table).update(row).eq('id', id).eq(link.fk, parent).select('id')
      : supabase.from(spec.table).insert(row).select('id')
  }

  const { data, error } = await query
  if (error) return keep(failed(`save ${kind}`, error))
  if (!data || data.length === 0) return keep({ error: 'That record no longer exists. Reload the page.' })

  revalidatePath(`/admin/students/${student}`)
  revalidatePath('/admin')
  // An edit keeps what was saved; a new record's form starts empty again.
  const saved: ActionState = { ok: id || kind === 'student_profiles' ? 'Saved.' : `Added the ${spec.noun}.`, done: Date.now() }
  return id || kind === 'student_profiles' ? keep(saved) : saved
}

export async function deleteRecord(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await ownerClient()
  if (!ctx) return NOT_ALLOWED
  const { supabase } = ctx

  const kind = text(form, '_record')
  const student = text(form, '_student')
  const id = text(form, '_id')
  const parent = text(form, '_parent')
  if (!isRecordKind(kind) || kind === 'student_profiles' || !isUuid(student) || !isUuid(id)) return FAILED
  const spec = RECORDS[kind]

  let query
  if (spec.parent === 'student') {
    query = supabase.from(spec.table).delete().eq('id', id).eq('student_id', student).select('id')
  } else {
    if (!isUuid(parent)) return FAILED
    const link = PARENT_TABLE[spec.parent]
    const { data: owned, error: ownedError } = await supabase
      .from(link.table)
      .select('id')
      .eq('id', parent)
      .eq('student_id', student)
      .maybeSingle()
    if (ownedError) return failed(`${kind} parent`, ownedError)
    if (!owned) return FAILED
    query = supabase.from(spec.table).delete().eq('id', id).eq(link.fk, parent).select('id')
  }

  const { data, error } = await query
  if (error) return failed(`delete ${kind}`, error)
  if (!data || data.length === 0) return { error: 'That record no longer exists. Reload the page.' }

  revalidatePath(`/admin/students/${student}`)
  revalidatePath('/admin')
  return { ok: `Deleted the ${spec.noun}.`, done: Date.now() }
}

/* ------------------------------ accounts ------------------------------ */

const STATUSES: readonly AccountStatus[] = ['pending', 'approved', 'suspended']

/** Approve, suspend or reinstate an account, optionally correcting its role. */
export async function setAccount(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await ownerClient()
  if (!ctx) return NOT_ALLOWED
  const { supabase } = ctx

  const target = text(form, 'target')
  const status = text(form, 'status')
  const role = text(form, 'role')
  if (!isUuid(target)) return FAILED
  if (status && !STATUSES.includes(status as AccountStatus)) return FAILED
  if (role && role !== 'student' && role !== 'parent') return { error: 'Choose student or parent.', fields: { role: 'Choose student or parent.' } }
  if (!status && !role) return FAILED

  const { error } = await supabase.rpc('admin_set_account', {
    target,
    new_status: status || null,
    new_role: role || null,
  })
  if (error) {
    logFailure('admin_set_account', error)
    return { error: accountErrorMessage(error.code) }
  }

  for (const path of ['/admin', '/admin/users', '/admin/approvals', '/admin/students', '/admin/parents']) revalidatePath(path)
  return {
    ok: status === 'approved' ? 'Approved.' : status === 'suspended' ? 'Suspended.' : 'Role updated.',
    done: Date.now(),
  }
}

/* ------------------------------ links ------------------------------ */

export async function linkGuardian(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await ownerClient()
  if (!ctx) return NOT_ALLOWED
  const parent = text(form, 'parent')
  const student = text(form, 'student')
  if (!isUuid(parent)) return { error: 'Choose a parent.', fields: { parent: 'Choose a parent.' } }
  if (!isUuid(student)) return { error: 'Choose a student.', fields: { student: 'Choose a student.' } }

  const { error } = await ctx.supabase.rpc('admin_link_guardian', { parent, student })
  if (error) {
    logFailure('admin_link_guardian', error)
    return { error: accountErrorMessage(error.code) }
  }
  revalidatePath(`/admin/students/${student}`)
  revalidatePath('/admin/parents')
  revalidatePath('/admin/students')
  return { ok: 'Linked.', done: Date.now() }
}

export async function unlinkGuardian(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await ownerClient()
  if (!ctx) return NOT_ALLOWED
  const parent = text(form, 'parent')
  const student = text(form, 'student')
  if (!isUuid(parent) || !isUuid(student)) return FAILED

  const { error } = await ctx.supabase.rpc('admin_unlink_guardian', { parent, student })
  if (error) {
    logFailure('admin_unlink_guardian', error)
    return { error: accountErrorMessage(error.code) }
  }
  revalidatePath(`/admin/students/${student}`)
  revalidatePath('/admin/parents')
  revalidatePath('/admin/students')
  return { ok: 'Link removed.', done: Date.now() }
}
