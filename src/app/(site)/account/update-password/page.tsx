import type { Metadata } from 'next'
import { UpdatePassword } from '@/components/portal/PasswordRecovery'

export const metadata: Metadata = { title: 'Choose a new password' }

export default function UpdatePasswordPage() {
  return <UpdatePassword />
}
