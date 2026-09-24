import type { Metadata } from 'next'
import { SignUpForm } from '@/components/portal/SignUpForm'

export const metadata: Metadata = {
  title: 'Create a student account',
  // Registration is approval-gated and not yet open; not a landing page.
  robots: { index: false, follow: false },
}

export default function StudentSignUpPage() {
  return <SignUpForm audience="student" />
}
