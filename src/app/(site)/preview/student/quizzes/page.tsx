import StudentQuizzes from '@/components/portal/pages/student/Quizzes'
import { getSampleStudentRecord } from '@/lib/portal/data'

export default async function StudentQuizzesPreviewPage() {
  return <StudentQuizzes base="/preview/student" record={await getSampleStudentRecord()} preview />
}
