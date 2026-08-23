'use client'

import { useState } from 'react'
import { INITIAL_FORM_STATE, type FormState } from '@/lib/contact/types'
import { deliverEnquiry } from '@/lib/contact/submit'
import { formatEnquiry, readForm, toEnquiry, validateEnquiry } from '@/lib/contact/validate'
import { Button } from '@/components/ui/Button'
import { PROGRAMS } from '@/content/programs'
import { CONTACT, whatsappLink } from '@/content/site'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-xl border bg-white px-4 py-3 text-[0.95rem] text-deep-800 placeholder:text-deep-300 transition-colors duration-200 focus:border-sky-400'

function Field({
  label,
  name,
  error,
  children,
  hint,
  required,
}: {
  label: string
  name: string
  error?: string
  children: React.ReactNode
  hint?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-display text-sm font-semibold text-deep-700">
        {label}
        {required ? (
          <span className="ml-1 text-sky-500" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 font-normal text-deep-300">optional</span>
        )}
      </label>
      {hint ? <p className="mt-1 text-xs text-deep-400">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert-600">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
            <path
              d="M8 5v4m0 2.5h.01M8 1.5 14.5 13.5h-13L8 1.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  )
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Sending…' : 'Send message'}
    </Button>
  )
}

export function ContactForm() {
  /**
   * Submission runs entirely in the browser. The site is deployed as a static
   * export (GitHub Pages), which has no server to run a Server Action — so the
   * same validation rules run here instead, via `@/lib/contact/validate`.
   */
  const [state, setState] = useState<FormState>(INITIAL_FORM_STATE)
  const [pending, setPending] = useState(false)
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null)
  const v = state.values ?? {}
  const e = state.errors ?? {}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    // Honeypot — real visitors never fill this hidden field.
    if ((formData.get('company') as string | null)?.trim()) {
      setState({ status: 'success', message: 'Thank you — your message has been sent.' })
      return
    }

    const values = readForm(formData)
    const errors = validateEnquiry(values)

    if (Object.keys(errors).length > 0) {
      setState({
        status: 'error',
        message: 'Please check the highlighted fields.',
        errors,
        values,
      })
      return
    }

    setPending(true)
    const enquiry = toEnquiry(values)
    const result = await deliverEnquiry(enquiry)
    setPending(false)

    if (result.ok) {
      setState({
        status: 'success',
        message: 'Thank you — your message has been sent. You will receive a reply shortly.',
      })
      return
    }

    if (result.reason === 'unconfigured') {
      // Nothing is silently dropped: the completed enquiry is handed to
      // WhatsApp with every field already filled in.
      setWhatsappHref(whatsappLink(formatEnquiry(enquiry)))
      setState({
        status: 'unconfigured',
        message:
          'Email delivery is not connected yet, so this message was not sent. Please reach out on WhatsApp or by email and you will get a reply straight away.',
        values,
      })
      return
    }

    setState({
      status: 'error',
      message:
        'Something went wrong sending your message. Please try again, or reach out on WhatsApp.',
      values,
    })
  }

  // Both dropdowns stay controlled so their value is always readable from
  // React state as well as from the DOM.
  const [choices, setChoices] = useState({ role: '', interest: '' })

  if (state.status === 'success') {
    return (
      <div className="rounded-panel border border-growth-200 bg-growth-50/60 p-8 text-center sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-growth-100">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-growth-600" aria-hidden="true">
            <path
              d="M5 12.5 10 17.5 19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="mt-5 font-display text-xl font-bold text-deep-700">Message sent</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-deep-600">{state.message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Status banners */}
      {state.status === 'error' && !state.errors ? (
        <div role="alert" className="rounded-card border border-alert-200 bg-alert-50 p-4 text-sm text-alert-800">
          {state.message}
        </div>
      ) : null}

      {state.status === 'unconfigured' ? (
        <div role="alert" className="rounded-card border border-alert-200 bg-alert-50 p-4">
          <p className="text-sm leading-relaxed text-alert-800">{state.message}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href={whatsappHref ?? whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-sm font-semibold text-alert-700 underline underline-offset-2"
            >
              WhatsApp {CONTACT.whatsappDisplay}
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-display text-sm font-semibold text-alert-700 underline underline-offset-2"
            >
              {CONTACT.email}
            </a>
          </div>
        </div>
      ) : null}

      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" error={e.name} required>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={v.name}
            autoComplete="name"
            aria-invalid={Boolean(e.name)}
            aria-describedby={e.name ? 'name-error' : undefined}
            className={cn(fieldBase, e.name ? 'border-alert-300' : 'border-deep-200')}
            placeholder="Student or parent name"
          />
        </Field>

        <Field label="Email" name="email" error={e.email} required>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={v.email}
            autoComplete="email"
            aria-invalid={Boolean(e.email)}
            aria-describedby={e.email ? 'email-error' : undefined}
            className={cn(fieldBase, e.email ? 'border-alert-300' : 'border-deep-200')}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Phone / WhatsApp" name="phone" error={e.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={v.phone}
            autoComplete="tel"
            aria-invalid={Boolean(e.phone)}
            aria-describedby={e.phone ? 'phone-error' : undefined}
            className={cn(fieldBase, e.phone ? 'border-alert-300' : 'border-deep-200')}
            placeholder="+20 …"
          />
        </Field>

        <Field label="I am a" name="role" error={e.role} required>
          <select
            id="role"
            name="role"
            value={choices.role}
            onChange={(event) => setChoices((c) => ({ ...c, role: event.target.value }))}
            aria-invalid={Boolean(e.role)}
            aria-describedby={e.role ? 'role-error' : undefined}
            className={cn(fieldBase, e.role ? 'border-alert-300' : 'border-deep-200')}
          >
            <option value="" disabled>
              Choose one…
            </option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field
        label="Interested in"
        name="interest"
        error={e.interest}
        required
        hint="Not sure yet? Choose “Not sure — please advise” and the assessment will decide."
      >
        <select
          id="interest"
          name="interest"
          value={choices.interest}
          onChange={(event) => setChoices((c) => ({ ...c, interest: event.target.value }))}
          aria-invalid={Boolean(e.interest)}
          aria-describedby={e.interest ? 'interest-error' : undefined}
          className={cn(fieldBase, e.interest ? 'border-alert-300' : 'border-deep-200')}
        >
          <option value="" disabled>
            Choose a program…
          </option>
          {PROGRAMS.map((p) => (
            <option key={p.slug} value={p.title}>
              {p.title}
            </option>
          ))}
          <option value="Not sure — please advise">Not sure — please advise</option>
        </select>
      </Field>

      <Field label="Message" name="message" error={e.message} required>
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={v.message}
          maxLength={2000}
          aria-invalid={Boolean(e.message)}
          aria-describedby={e.message ? 'message-error' : undefined}
          className={cn(fieldBase, 'resize-y', e.message ? 'border-alert-300' : 'border-deep-200')}
          placeholder="Current year, target exam date, and anything that would help — for example which topics feel weakest."
        />
      </Field>

      <div className="flex flex-col gap-4 border-t border-deep-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-deep-400">
          Your details are used only to reply to this enquiry.
        </p>
        <SubmitButton pending={pending} />
      </div>
    </form>
  )
}
