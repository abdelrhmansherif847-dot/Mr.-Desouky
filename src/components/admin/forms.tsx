'use client'

import { useActionState, useId, useState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  deleteRecord,
  linkGuardian,
  saveRecord,
  setAccount,
  unlinkGuardian,
  type ActionState,
} from '@/lib/admin/actions'
import { RECORDS, TRANSITIONS, type AccountStatus, type Field, type RecordKind } from '@/lib/admin/forms'
import { cn } from '@/lib/utils'

/**
 * The owner's forms. Each one posts to a server action that re-checks the
 * owner and re-validates everything (lib/admin/actions.ts); what happens
 * here is only for a clear, field-by-field response.
 */

const INITIAL: ActionState = {}

const inputCls =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-deep-700 shadow-sm transition-colors duration-150 ' +
  'placeholder:text-deep-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 ' +
  'disabled:cursor-not-allowed disabled:bg-mist'

function Submit({
  children,
  tone = 'primary',
  label,
}: {
  children: React.ReactNode
  tone?: 'primary' | 'quiet' | 'danger'
  /** Accessible name when the visible text needs context (e.g. whose account). */
  label?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      aria-label={label}
      disabled={pending}
      className={cn(
        'inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-wait disabled:opacity-60',
        tone === 'primary' && 'bg-sky-500 text-white hover:bg-sky-600',
        tone === 'quiet' && 'border border-deep-200 bg-white text-deep-700 hover:bg-deep-50',
        tone === 'danger' && 'border border-alert-200 bg-white text-alert-700 hover:bg-alert-50',
      )}
    >
      {pending ? 'Saving…' : children}
    </button>
  )
}

function Status({ state, id }: { state: ActionState; id: string }) {
  if (state.error) {
    return (
      <p id={id} role="alert" className="text-sm font-medium text-alert-700">
        {state.error}
      </p>
    )
  }
  if (state.ok) {
    return (
      <p id={id} role="status" className="text-sm font-medium text-growth-700">
        {state.ok}
      </p>
    )
  }
  return <p id={id} className="sr-only" aria-live="polite" />
}

function FieldInput({
  field,
  id,
  value,
  error,
  errorId,
  options,
}: {
  field: Field
  id: string
  value: string
  error?: string
  errorId: string
  options?: { value: string; label: string }[]
}) {
  const common = {
    id,
    name: field.name,
    defaultValue: value,
    required: field.required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cn(inputCls, error ? 'border-alert-400' : 'border-deep-200'),
  }
  switch (field.kind) {
    case 'text':
      return field.multiline ? (
        <textarea {...common} rows={3} maxLength={field.max} />
      ) : (
        <input {...common} type="text" maxLength={field.max} />
      )
    case 'int':
      return <input {...common} type="number" inputMode="numeric" step={1} min={field.min} max={field.max} />
    case 'decimal':
      return <input {...common} type="number" inputMode="decimal" step={0.01} min={field.min} max={field.max} />
    case 'date':
      return <input {...common} type="date" />
    case 'time':
      return <input {...common} type="time" />
    case 'enum':
      return (
        <select {...common}>
          {field.required ? null : <option value="">—</option>}
          {field.options.map((option) => (
            <option key={option} value={option}>
              {field.labels?.[option] ?? option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      )
    case 'ref':
      return (
        <select {...common}>
          <option value="">—</option>
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
  }
}

const WIDE = new Set(['topic', 'title', 'description', 'preparation', 'notes', 'feedback', 'content', 'next_step', 'message', 'program_title'])

/**
 * A create or edit form for one record type, generated from its spec so
 * the limits shown are the limits enforced.
 */
export function RecordForm({
  kind,
  student,
  parent,
  id,
  initial,
  submitLabel,
  refOptions,
}: {
  kind: RecordKind
  student: string
  parent?: string
  id?: string
  initial?: Record<string, string | number | null>
  submitLabel: string
  refOptions?: { value: string; label: string }[]
}) {
  const [state, action] = useActionState(saveRecord, INITIAL)
  const uid = useId()
  const spec = RECORDS[kind]

  // React resets the form after each submission, back to these defaults:
  // what was just submitted (echoed by the action) wins over the saved row,
  // so a rejected entry is never lost and a new record's form clears once
  // it is added.
  return (
    <form action={action} noValidate className="space-y-4">
      <input type="hidden" name="_record" value={kind} />
      <input type="hidden" name="_student" value={student} />
      {parent ? <input type="hidden" name="_parent" value={parent} /> : null}
      {id ? <input type="hidden" name="_id" value={id} /> : null}
      <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {spec.fields.map((field: Field) => {
          const fid = `${uid}-${field.name}`
          const eid = `${fid}-error`
          const error = state.fields?.[field.name]
          const raw = initial?.[field.name]
          const value =
            state.values?.[field.name] ??
            (raw === null || raw === undefined ? defaultFor(field) : String(raw).slice(0, field.kind === 'time' ? 5 : undefined))
          return (
            <div
              key={field.name}
              className={cn(
                WIDE.has(field.name) && 'sm:col-span-2',
                field.kind === 'text' && field.multiline && 'lg:col-span-4',
              )}
            >
              <label htmlFor={fid} className="mb-1 block text-xs font-semibold text-deep-600">
                {field.label}
                {field.required ? <span className="text-deep-300"> *</span> : null}
              </label>
              <FieldInput field={field} id={fid} value={value} error={error} errorId={eid} options={refOptions} />
              {error ? (
                <p id={eid} className="mt-1 text-xs font-medium text-alert-700">
                  {error}
                </p>
              ) : field.hint ? (
                <p className="mt-1 text-xs text-deep-400">{field.hint}</p>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Submit>{submitLabel}</Submit>
        <Status state={state} id={`${uid}-status`} />
      </div>
    </form>
  )
}

function defaultFor(field: Field): string {
  if (field.kind === 'date' && field.required) return new Date().toISOString().slice(0, 10)
  if (field.kind === 'enum' && field.required) return field.options[0]
  if (field.name === 'duration_minutes') return '120'
  if (field.name === 'progress' || field.name === 'position') return '0'
  if (field.name === 'kind' && field.kind === 'text') return 'Milestone'
  if (field.name === 'category') return 'General'
  return ''
}

/** Delete with a second, explicit confirmation step — no browser dialog. */
export function DeleteRecord({
  kind,
  student,
  id,
  parent,
  noun,
}: {
  kind: RecordKind
  student: string
  id: string
  parent?: string
  noun: string
}) {
  const [state, action] = useActionState(deleteRecord, INITIAL)
  const [confirming, setConfirming] = useState(false)
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full px-3 py-1.5 text-xs font-semibold text-alert-700 hover:bg-alert-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        Delete
      </button>
    )
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="_record" value={kind} />
      <input type="hidden" name="_student" value={student} />
      <input type="hidden" name="_id" value={id} />
      {parent ? <input type="hidden" name="_parent" value={parent} /> : null}
      <span className="text-xs text-deep-500">Delete this {noun}?</span>
      <Submit tone="danger">Yes, delete</Submit>
      <button type="button" onClick={() => setConfirming(false)} className="px-2 py-1.5 text-xs font-semibold text-deep-500 hover:text-deep-700">
        Keep
      </button>
      {state.error ? <span role="alert" className="text-xs font-medium text-alert-700">{state.error}</span> : null}
    </form>
  )
}

const ACTION_LABEL: Record<AccountStatus, string> = { approved: 'Approve', suspended: 'Suspend', pending: 'Pending' }

/**
 * The allowed status moves for one account (the same list the database
 * enforces), plus a role correction between student and parent.
 */
export function AccountActions({
  target,
  status,
  role,
  name,
  compact,
}: {
  target: string
  status: AccountStatus
  role: string
  /** The account's name or email, for screen-reader labels. */
  name: string
  compact?: boolean
}) {
  const [state, action] = useActionState(setAccount, INITIAL)
  const uid = useId()
  const moves = TRANSITIONS[status]
  const canCorrect = role === 'student' || role === 'parent'

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {moves.map((to) => (
          <form key={to} action={action}>
            <input type="hidden" name="target" value={target} />
            <input type="hidden" name="status" value={to} />
            <Submit
              tone={to === 'suspended' ? 'danger' : 'primary'}
              label={`${status === 'suspended' && to === 'approved' ? 'Reinstate' : ACTION_LABEL[to]} ${name}`}
            >
              {status === 'suspended' && to === 'approved' ? 'Reinstate' : ACTION_LABEL[to]}
            </Submit>
          </form>
        ))}
        {canCorrect && !compact ? (
          <form action={action} className="flex items-center gap-2">
            <input type="hidden" name="target" value={target} />
            <input type="hidden" name="role" value={role === 'student' ? 'parent' : 'student'} />
            <Submit tone="quiet" label={`Make ${name} a ${role === 'student' ? 'parent' : 'student'}`}>
              Make {role === 'student' ? 'parent' : 'student'}
            </Submit>
          </form>
        ) : null}
      </div>
      <Status state={state} id={`${uid}-status`} />
    </div>
  )
}

/** Link a parent and a student. One side is fixed, the other chosen. */
export function LinkForm({
  fixed,
  fixedId,
  choices,
}: {
  fixed: 'parent' | 'student'
  fixedId: string
  choices: { value: string; label: string }[]
}) {
  const [state, action] = useActionState(linkGuardian, INITIAL)
  const uid = useId()
  const chosen = fixed === 'parent' ? 'student' : 'parent'
  const error = state.fields?.[chosen]
  if (choices.length === 0) {
    return <p className="text-xs text-deep-400">No {chosen} accounts are available to link.</p>
  }
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name={fixed} value={fixedId} />
      <div className="min-w-[12rem] flex-1">
        <label htmlFor={`${uid}-choice`} className="mb-1 block text-xs font-semibold text-deep-600">
          Link a {chosen}
        </label>
        <select
          id={`${uid}-choice`}
          name={chosen}
          defaultValue=""
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${uid}-status` : undefined}
          className={cn(inputCls, error ? 'border-alert-400' : 'border-deep-200')}
        >
          <option value="">Choose…</option>
          {choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <Submit tone="quiet">Link</Submit>
      <div className="basis-full">
        <Status state={state} id={`${uid}-status`} />
      </div>
    </form>
  )
}

export function UnlinkButton({ parent, student, label }: { parent: string; student: string; label: string }) {
  const [state, action] = useActionState(unlinkGuardian, INITIAL)
  return (
    <form action={action} className="inline-flex items-center gap-2">
      <input type="hidden" name="parent" value={parent} />
      <input type="hidden" name="student" value={student} />
      <button
        type="submit"
        aria-label={label}
        className="rounded-full px-2.5 py-1 text-xs font-semibold text-alert-700 hover:bg-alert-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        Unlink
      </button>
      {state.error ? <span role="alert" className="text-xs text-alert-700">{state.error}</span> : null}
    </form>
  )
}
