import type { Metadata } from 'next'
import { AccountNotice } from '@/components/portal/AccountNotice'

export const metadata: Metadata = { title: 'Account suspended' }

export default function AccountSuspendedPage() {
  return (
    <AccountNotice
      state="suspended"
      eyebrow="Account"
      title="Your account is currently suspended."
      body="Please contact Mr. Desouky."
    />
  )
}
