import type { Metadata } from 'next'
import { RequestPasswordReset } from '@/components/portal/PasswordRecovery'

export const metadata: Metadata = { title: 'Reset your password' }

export default function ResetPasswordPage() {
  return <RequestPasswordReset />
}
