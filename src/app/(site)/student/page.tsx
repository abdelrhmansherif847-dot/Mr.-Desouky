import StudentOverview from '@/components/portal/pages/student/Overview'
import { requireMyStudentRecord } from '@/lib/portal/records'

export default async function StudentOverviewPage() {
  return <StudentOverview base="/student" record={await requireMyStudentRecord()} />
}
