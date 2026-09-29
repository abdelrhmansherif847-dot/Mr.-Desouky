/**
 * ADMIN RECORD FORMS — what each form accepts
 * ===========================================
 * One description per record type, used twice: by the server actions to
 * validate before anything is written, and by the forms to render inputs
 * with the same limits. The database (migration 0007) enforces the same
 * rules again with CHECK constraints, so this file is for clear, field-level
 * messages — not the last line of defence.
 *
 * Pure and dependency-free, so it is unit-tested directly (tests/).
 */

export const SESSION_STATUSES = ['scheduled', 'attended', 'missed', 'cancelled'] as const
export const HOMEWORK_STATUSES = ['assigned', 'completed', 'late', 'missed'] as const
export const REVIEW_STATUSES = ['draft', 'published'] as const
export const VISIBILITIES = ['shared', 'student', 'parent', 'internal'] as const
export const EXAMS = ['SAT', 'EST'] as const
export const LEVELS = ['Basic', 'Advanced'] as const
export const SESSION_KINDS = ['Lesson', 'Review', 'Quiz', 'Mock exam', 'Mock debrief', 'Assessment', 'Consultation'] as const

type Base = { name: string; label: string; required?: boolean; hint?: string }
export type Field =
  | (Base & { kind: 'text'; max: number; multiline?: boolean })
  | (Base & { kind: 'int'; min: number; max?: number })
  | (Base & { kind: 'decimal'; min: number; max: number })
  | (Base & { kind: 'date' })
  | (Base & { kind: 'time' })
  | (Base & { kind: 'enum'; options: readonly string[]; labels?: Record<string, string> })
  | (Base & { kind: 'ref' })

export type Value = string | number | null
export type Values = Record<string, Value>
export type Errors = Record<string, string>

export type RecordSpec = {
  table: string
  /** Who a row belongs to: a student directly, or a quiz/mock of theirs. */
  parent: 'student' | 'quiz' | 'mock'
  noun: string
  fields: Field[]
  /** Cross-field rules, after each field has parsed on its own. */
  check?: (v: Values) => Errors
}

const within = (a: string, b: string, message: string) => (v: Values): Errors =>
  typeof v[a] === 'number' && typeof v[b] === 'number' && (v[a] as number) > (v[b] as number) ? { [a]: message } : {}

export const RECORDS = {
  student_profiles: {
    table: 'student_profiles',
    parent: 'student',
    noun: 'programme',
    fields: [
      { name: 'exam', label: 'Exam', kind: 'enum', options: EXAMS },
      { name: 'level', label: 'Level', kind: 'enum', options: LEVELS },
      { name: 'program_title', label: 'Programme title', kind: 'text', max: 120, hint: 'e.g. SAT Math — Basic' },
      { name: 'started_on', label: 'Started on', kind: 'date' },
      {
        name: 'current_stage',
        label: 'Journey stage',
        kind: 'enum',
        required: true,
        options: ['0', '1', '2', '3', '4', '5', '6'],
        labels: {
          '0': '1 — Assessment', '1': '2 — Foundation', '2': '3 — Practice', '3': '4 — Analysis',
          '4': '5 — Advanced Training', '5': '6 — Mock Exams', '6': '7 — Final Preparation',
        },
      },
      { name: 'target_exam_date', label: 'Exam date', kind: 'date' },
    ],
  },
  sessions: {
    table: 'sessions',
    parent: 'student',
    noun: 'session',
    fields: [
      { name: 'session_date', label: 'Date', kind: 'date', required: true },
      { name: 'start_time', label: 'Start time', kind: 'time' },
      { name: 'duration_minutes', label: 'Minutes', kind: 'int', min: 15, max: 480, required: true },
      { name: 'kind', label: 'Kind', kind: 'enum', options: SESSION_KINDS, required: true },
      { name: 'topic', label: 'Topic', kind: 'text', max: 160, required: true },
      { name: 'status', label: 'Status', kind: 'enum', options: SESSION_STATUSES, required: true },
      { name: 'preparation', label: 'What to prepare', kind: 'text', max: 1000, multiline: true, hint: 'Shown to the student and parents' },
      { name: 'notes', label: 'Session notes', kind: 'text', max: 2000, multiline: true, hint: 'Shown to the student and parents' },
    ],
  },
  homework: {
    table: 'homework',
    parent: 'student',
    noun: 'homework set',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', max: 160, required: true },
      { name: 'topic', label: 'Topic', kind: 'text', max: 120 },
      { name: 'description', label: 'Instructions', kind: 'text', max: 2000, multiline: true },
      { name: 'assigned_on', label: 'Set on', kind: 'date', required: true },
      { name: 'due_on', label: 'Due on', kind: 'date', required: true },
      { name: 'status', label: 'Status', kind: 'enum', options: HOMEWORK_STATUSES, required: true },
      { name: 'progress', label: 'Progress %', kind: 'int', min: 0, max: 100, required: true },
      { name: 'score', label: 'Score %', kind: 'decimal', min: 0, max: 100 },
      { name: 'feedback', label: 'Written note', kind: 'text', max: 2000, multiline: true },
    ],
    check: (v): Errors =>
      typeof v.assigned_on === 'string' && typeof v.due_on === 'string' && v.due_on < v.assigned_on
        ? { due_on: 'The due date cannot be before the date it was set.' }
        : {},
  },
  quizzes: {
    table: 'quizzes',
    parent: 'student',
    noun: 'quiz',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', max: 160, required: true },
      { name: 'taken_on', label: 'Taken on', kind: 'date', required: true },
      { name: 'score', label: 'Score', kind: 'int', min: 0, required: true },
      { name: 'total', label: 'Out of', kind: 'int', min: 1, required: true },
      { name: 'notes', label: 'Notes', kind: 'text', max: 2000, multiline: true },
    ],
    check: within('score', 'total', 'The score cannot be more than the total.'),
  },
  quiz_topic_results: {
    table: 'quiz_topic_results',
    parent: 'quiz',
    noun: 'topic result',
    fields: [
      { name: 'topic', label: 'Topic', kind: 'text', max: 120, required: true },
      { name: 'correct', label: 'Correct', kind: 'int', min: 0, required: true },
      { name: 'total', label: 'Out of', kind: 'int', min: 1, required: true },
    ],
    check: within('correct', 'total', 'Correct answers cannot be more than the total.'),
  },
  reviews: {
    table: 'reviews',
    parent: 'student',
    noun: 'review',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', max: 160, required: true },
      { name: 'quiz_id', label: 'About quiz', kind: 'ref' },
      { name: 'reviewed_on', label: 'Date', kind: 'date', required: true },
      { name: 'content', label: 'Review', kind: 'text', max: 4000, multiline: true, required: true },
      { name: 'next_step', label: 'Next step', kind: 'text', max: 1000, multiline: true },
      {
        name: 'status',
        label: 'Status',
        kind: 'enum',
        options: REVIEW_STATUSES,
        required: true,
        labels: { draft: 'Draft — only you', published: 'Published — student and parents' },
      },
    ],
  },
  mocks: {
    table: 'mocks',
    parent: 'student',
    noun: 'mock exam',
    fields: [
      { name: 'exam', label: 'Exam', kind: 'enum', options: EXAMS, required: true },
      { name: 'title', label: 'Title', kind: 'text', max: 120, required: true },
      { name: 'taken_on', label: 'Taken on', kind: 'date', required: true },
      { name: 'score', label: 'Score', kind: 'int', min: 0, required: true },
      { name: 'total', label: 'Out of', kind: 'int', min: 1, required: true },
      { name: 'notes', label: 'Notes', kind: 'text', max: 2000, multiline: true },
    ],
    check: within('score', 'total', 'The score cannot be more than the total.'),
  },
  mock_sections: {
    table: 'mock_sections',
    parent: 'mock',
    noun: 'section',
    fields: [
      { name: 'name', label: 'Section', kind: 'text', max: 80, required: true },
      { name: 'position', label: 'Order', kind: 'int', min: 0, max: 50, required: true },
      { name: 'correct', label: 'Correct', kind: 'int', min: 0, required: true },
      { name: 'total', label: 'Out of', kind: 'int', min: 1, required: true },
      { name: 'minutes_used', label: 'Minutes used', kind: 'int', min: 0, max: 600 },
      { name: 'minutes_allowed', label: 'Minutes allowed', kind: 'int', min: 1, max: 600 },
    ],
    check: within('correct', 'total', 'Correct answers cannot be more than the total.'),
  },
  feedback: {
    table: 'feedback',
    parent: 'student',
    noun: 'feedback note',
    fields: [
      { name: 'category', label: 'About', kind: 'text', max: 80, required: true, hint: 'e.g. Quiz 3, Mock 2, General' },
      { name: 'given_on', label: 'Date', kind: 'date', required: true },
      { name: 'message', label: 'Feedback', kind: 'text', max: 2000, multiline: true, required: true },
      { name: 'next_step', label: 'Next step', kind: 'text', max: 1000, multiline: true },
      {
        name: 'visibility',
        label: 'Who can see it',
        kind: 'enum',
        options: VISIBILITIES,
        required: true,
        labels: {
          shared: 'Student and parents',
          student: 'Student only',
          parent: 'Parents only',
          internal: 'Internal — only you',
        },
      },
    ],
  },
  achievements: {
    table: 'achievements',
    parent: 'student',
    noun: 'achievement',
    fields: [
      { name: 'title', label: 'Title', kind: 'text', max: 120, required: true },
      { name: 'kind', label: 'Kind', kind: 'text', max: 40, required: true, hint: 'e.g. Milestone, Consistency' },
      { name: 'earned_on', label: 'Earned on', kind: 'date', required: true },
      { name: 'description', label: 'Description', kind: 'text', max: 500, multiline: true },
    ],
  },
} satisfies Record<string, RecordSpec>

export type RecordKind = keyof typeof RECORDS

export function isRecordKind(value: unknown): value is RecordKind {
  return typeof value === 'string' && Object.hasOwn(RECORDS, value)
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value)

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

function parseField(field: Field, raw: string): { value: Value } | { error: string } {
  const text = raw.trim()
  if (!text) return field.required ? { error: `${field.label} is required.` } : { value: null }

  switch (field.kind) {
    case 'text':
      if (text.length > field.max) return { error: `${field.label} must be ${field.max} characters or fewer.` }
      return { value: text }
    case 'int': {
      if (!/^-?\d+$/.test(text)) return { error: `${field.label} must be a whole number.` }
      const n = Number(text)
      if (n < field.min) return { error: `${field.label} must be at least ${field.min}.` }
      if (field.max !== undefined && n > field.max) return { error: `${field.label} must be at most ${field.max}.` }
      return { value: n }
    }
    case 'decimal': {
      if (!/^-?\d+(\.\d{1,2})?$/.test(text)) return { error: `${field.label} must be a number with up to two decimals.` }
      const n = Number(text)
      if (n < field.min || n > field.max) return { error: `${field.label} must be between ${field.min} and ${field.max}.` }
      return { value: n }
    }
    case 'date':
      return validDate(text) ? { value: text } : { error: `${field.label} must be a real date.` }
    case 'time':
      return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? { value: text } : { error: `${field.label} must be a time like 17:00.` }
    case 'enum':
      return field.options.includes(text) ? { value: text } : { error: `Choose a ${field.label.toLowerCase()} from the list.` }
    case 'ref':
      return isUuid(text) ? { value: text } : { error: `Choose a ${field.label.toLowerCase()} from the list.` }
  }
}

export type Parsed = { ok: true; values: Values } | { ok: false; errors: Errors }

/**
 * Parse submitted form values against a record type. Unknown keys are
 * ignored — only the listed columns can ever be written — and every error is
 * attached to the one field it is about.
 */
export function parseRecord(kind: RecordKind, input: Record<string, string | undefined>): Parsed {
  const spec: RecordSpec = RECORDS[kind]
  const values: Values = {}
  const errors: Errors = {}
  for (const field of spec.fields) {
    const result = parseField(field, input[field.name] ?? '')
    if ('error' in result) errors[field.name] = result.error
    else values[field.name] = field.name === 'current_stage' && result.value !== null ? Number(result.value) : result.value
  }
  if (Object.keys(errors).length === 0 && spec.check) Object.assign(errors, spec.check(values))
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values }
}

/* ------------------------------ accounts ------------------------------ */

export type AccountStatus = 'pending' | 'approved' | 'suspended'

/** The status moves the owner may make — the same list admin_set_account enforces. */
export const TRANSITIONS: Record<AccountStatus, readonly AccountStatus[]> = {
  pending: ['approved', 'suspended'],
  approved: ['suspended'],
  suspended: ['approved'],
}

export function canMove(from: AccountStatus, to: AccountStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

/** Postgres error codes from the admin functions, in the owner's words. */
export function accountErrorMessage(code: string | undefined): string {
  switch (code) {
    case '42501':
      return 'Only the owner can do that.'
    case '22023':
      return 'That change is not allowed for this account.'
    case '23514':
      return 'Links join a parent account to a student account. Remove this account’s links before changing its role.'
    case 'P0002':
      return 'That account no longer exists.'
    default:
      return 'That did not save. Try again in a moment.'
  }
}
