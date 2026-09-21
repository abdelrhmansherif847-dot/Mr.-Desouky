import { PortalAuth } from '@/components/portal/PortalAuth'
import { pageMeta } from '@/lib/seo'

export const metadata = {
  ...pageMeta({
    title: 'Student Login',
    description:
      'The student portal — journey, sessions, homework, quizzes, reviews, mock exams, progress and achievements in one place.',
    path: '/login/student',
  }),
  robots: { index: false, follow: true },
}

export default function StudentLoginPage() {
  return <PortalAuth initial="student" />
}
