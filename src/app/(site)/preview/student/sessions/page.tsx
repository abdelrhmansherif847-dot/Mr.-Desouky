import StudentSessions from '@/components/portal/pages/student/Sessions'
import { getSampleStudentRecord } from '@/lib/portal/data'

export default async function StudentSessionsPreviewPage() {
  return <StudentSessions base="/preview/student" record={await getSampleStudentRecord()} preview />
}
