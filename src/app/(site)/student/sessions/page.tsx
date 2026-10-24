import StudentSessions from '@/components/portal/pages/student/Sessions'
import { requireMyStudentRecord } from '@/lib/portal/records'

export default async function StudentSessionsPage() {
  return <StudentSessions base="/student" record={await requireMyStudentRecord()} />
}
