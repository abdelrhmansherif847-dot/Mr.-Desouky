import type { Enquiry, EnquiryRole } from './types'

/**
 * Enquiry validation — a pure module with no server dependency.
 *
 * This used to live inside a Server Action. GitHub Pages serves static files
 * and cannot run one, so the same rules now run in the browser. The rules
 * themselves are unchanged; only where they execute has moved.
 */

const MAX = { name: 120, email: 200, phone: 40, interest: 80, message: 2000 }
const ROLES: EnquiryRole[] = ['student', 'parent', 'other']

export type EnquiryInput = {
  name: string
  email: string
  phone: string
  role: string
  interest: string
  message: string
}

export function readForm(formData: FormData): EnquiryInput {
  const str = (key: string) => {
    const value = formData.get(key)
    return typeof value === 'string' ? value.trim() : ''
  }

  return {
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    role: str('role'),
    interest: str('interest'),
    message: str('message'),
  }
}

/** Deliberately permissive — the goal is to catch typos, not to police addresses. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

export function validateEnquiry(values: EnquiryInput): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.name) errors.name = 'Please enter a name.'
  else if (values.name.length > MAX.name) errors.name = 'That name is too long.'

  if (!values.email) errors.email = 'Please enter an email address.'
  else if (values.email.length > MAX.email) errors.email = 'That email address is too long.'
  else if (!looksLikeEmail(values.email)) errors.email = 'Please check the email address.'

  if (values.phone.length > MAX.phone) errors.phone = 'That phone number is too long.'

  if (!ROLES.includes(values.role as EnquiryRole)) errors.role = 'Please choose one.'

  if (!values.interest) errors.interest = 'Please choose a program.'
  else if (values.interest.length > MAX.interest) errors.interest = 'Invalid selection.'

  if (!values.message) errors.message = 'Please write a short message.'
  else if (values.message.length > MAX.message)
    errors.message = 'Please keep it under 2000 characters.'

  return errors
}

export function toEnquiry(values: EnquiryInput): Enquiry {
  return {
    ...values,
    role: values.role as EnquiryRole,
    submittedAt: new Date().toISOString(),
  }
}

/** Human-readable enquiry, used for the WhatsApp hand-off. */
export function formatEnquiry(enquiry: Enquiry): string {
  return [
    'Hello Mr. Desouky, I would like to ask about the programs.',
    '',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    enquiry.phone ? `Phone: ${enquiry.phone}` : null,
    `I am a: ${enquiry.role}`,
    `Interested in: ${enquiry.interest}`,
    '',
    enquiry.message,
  ]
    .filter((line) => line !== null)
    .join('\n')
}
