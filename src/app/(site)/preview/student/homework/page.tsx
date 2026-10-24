import StudentHomework from '@/components/portal/pages/student/Homework'
import { getSampleStudentRecord } from '@/lib/portal/data'

export default async function StudentHomeworkPreviewPage() {
  return <StudentHomework base="/preview/student" record={await getSampleStudentRecord()} preview />
}
