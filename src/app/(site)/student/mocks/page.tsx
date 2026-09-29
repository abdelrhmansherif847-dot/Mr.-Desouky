import StudentMocks from '@/components/portal/pages/student/Mocks'
import { requireMyStudentRecord } from '@/lib/portal/records'

export default async function StudentMocksPage() {
  return <StudentMocks base="/student" record={await requireMyStudentRecord()} />
}
