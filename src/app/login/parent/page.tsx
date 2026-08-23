import { LoginPanel } from '@/components/portal/LoginPanel'
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
  return (
    <LoginPanel
      audience="Parent"
      previewHref="/parent"
      points={[
        'Attendance and homework completion, session by session',
        'Quiz and mock performance, with the trend over time',
        'Which topics are secure and which are being worked on',
        'Written feedback after every quiz and mock',
      ]}
    />
  )
}
