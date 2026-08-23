'use server'

import { deliverEnquiry } from '@/lib/contact/deliver'
import type { Enquiry, EnquiryRole, FormState } from '@/lib/contact/types'

const MAX = { name: 120, email: 200, phone: 40, interest: 80, message: 2000 }
const ROLES: EnquiryRole[] = ['student', 'parent', 'other']

function str(data: FormData, key: string): string {
  const value = data.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** Deliberately permissive — the goal is to catch typos, not to police addresses. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

export async function submitEnquiry(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Honeypot — real visitors never fill this hidden field.
  if (str(formData, 'company')) {
    return { status: 'success', message: 'Thank you — your message has been sent.' }
  }

  const values = {
    name: str(formData, 'name'),
    email: str(formData, 'email'),
    phone: str(formData, 'phone'),
    role: str(formData, 'role'),
    interest: str(formData, 'interest'),
    message: str(formData, 'message'),
  }

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
  else if (values.message.length > MAX.message) errors.message = 'Please keep it under 2000 characters.'

  if (Object.keys(errors).length > 0) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors,
      values,
    }
  }

  const enquiry: Enquiry = {
    ...values,
    role: values.role as EnquiryRole,
    submittedAt: new Date().toISOString(),
  }

  const result = await deliverEnquiry(enquiry)

  if (result.ok) {
    return {
      status: 'success',
      message: 'Thank you — your message has been sent. You will receive a reply shortly.',
    }
  }

  if (result.reason === 'unconfigured') {
    return {
      status: 'unconfigured',
      message:
        'Email delivery is not connected yet, so this message was not sent. Please reach out on WhatsApp or by email and you will get a reply straight away.',
      values,
    }
  }

  return {
    status: 'error',
    message:
      'Something went wrong sending your message. Please try again, or reach out on WhatsApp.',
    values,
  }
}
