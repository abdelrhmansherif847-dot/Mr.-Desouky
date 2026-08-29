import { LoginPanel } from '@/components/portal/LoginPanel'
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
  return (
    <LoginPanel
      audience="Student"
      previewHref="/student"
      points={[
        'Where you are in the seven-stage journey',
        'Upcoming sessions and what to prepare',
        'Homework, quizzes, reviews and mock results',
        'Your strengths, your weak topics, and the next action',
      ]}
    />
  )
}
