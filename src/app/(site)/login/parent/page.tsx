import { PortalAuth } from '@/components/portal/PortalAuth'
import { pageMeta } from '@/lib/seo'

export const metadata = {
  ...pageMeta({
    title: 'Parent Login',
    description:
      'The parent portal — attendance, homework completion, quiz performance, mock scores, strengths, weaknesses and reports.',
    path: '/login/parent',
  }),
  robots: { index: false, follow: true },
}

export default function ParentLoginPage() {
  return <PortalAuth initial="parent" />
}
