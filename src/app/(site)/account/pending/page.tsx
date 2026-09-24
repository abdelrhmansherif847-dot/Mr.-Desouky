import type { Metadata } from 'next'
import { AccountNotice } from '@/components/portal/AccountNotice'

export const metadata: Metadata = { title: 'Awaiting approval' }

export default function AccountPendingPage() {
  return (
    <AccountNotice
      state="pending"
      eyebrow="Account"
      title="Your account is awaiting approval."
      body="Mr. Desouky reviews every new account personally. Once yours is approved, signing in will take you straight to your portal."
    />
  )
}
