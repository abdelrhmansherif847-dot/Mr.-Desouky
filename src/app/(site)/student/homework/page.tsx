import StudentHomework from '@/components/portal/pages/student/Homework'
import { requireMyStudentRecord } from '@/lib/portal/records'

export default async function StudentHomeworkPage() {
  return <StudentHomework base="/student" record={await requireMyStudentRecord()} />
}
