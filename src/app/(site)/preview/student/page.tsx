import StudentOverview from '@/components/portal/pages/student/Overview'
import { getSampleStudentRecord } from '@/lib/portal/data'

export default async function StudentOverviewPreviewPage() {
  return <StudentOverview base="/preview/student" record={await getSampleStudentRecord()} preview />
}
