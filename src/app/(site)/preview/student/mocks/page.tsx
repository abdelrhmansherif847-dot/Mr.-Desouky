import StudentMocks from '@/components/portal/pages/student/Mocks'
import { getSampleStudentRecord } from '@/lib/portal/data'

export default async function StudentMocksPreviewPage() {
  return <StudentMocks base="/preview/student" record={await getSampleStudentRecord()} preview />
}
