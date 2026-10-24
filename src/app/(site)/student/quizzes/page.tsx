import StudentQuizzes from '@/components/portal/pages/student/Quizzes'
import { requireMyStudentRecord } from '@/lib/portal/records'

export default async function StudentQuizzesPage() {
  return <StudentQuizzes base="/student" record={await requireMyStudentRecord()} />
}
