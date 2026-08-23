export type EnquiryRole = 'student' | 'parent' | 'other'

export type Enquiry = {
  name: string
  email: string
  phone: string
  role: EnquiryRole
  interest: string
  message: string
  submittedAt: string
}

export type FormState = {
  status: 'idle' | 'success' | 'error' | 'unconfigured'
  message: string
  /** Field-level errors, keyed by input name. */
  errors?: Record<string, string>
  /** Echoed back so the user does not lose what they typed. */
  values?: Record<string, string>
}

export const INITIAL_FORM_STATE: FormState = { status: 'idle', message: '' }
